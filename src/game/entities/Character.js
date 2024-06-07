import { Entity } from "engine/Entity.js";
import {
	CharacterPlayerData,
	CharacterStateType,
	WALK_SPEED,
	animations,
	getCharacterFrames,
} from "../constants/character.js";
import {
	CounterDirectionsLookup,
	Direction,
	MovementLookup,
} from "../constants/entities.js";
import { FRAME_TIME, HALF_TILE_SIZE, TILE_SIZE } from "../constants/game.js";
import { drawFrameOrigin } from "../../engine/context.js";
import * as control from "engine/inputHandler.js";
import { isZero } from "game/utils/utils.js";
import { CollisionTile } from "game/constants/LevelData.js";
import { drawBox, drawCross } from "game/utils/debug.js";
import { DEBUG } from "../constants/game.js";
import { Control } from "game/constants/controls.js";

export class Character extends Entity {
	image = document.querySelector("img#dino");

	id = 0;
	direction = Direction.DOWN;
	baseSpeedTime = WALK_SPEED;
	speedMultiplier = 1.2;
	animation = animations.moveAnimations[this.direction];
	// collisionMap = [...collisionMap];

	bombAmount = 1;
	bombStrength = 1;
	availableBombs = this.bombAmount;
	lastBombCell = undefined;

	constructor(id, time, getStageCollisionTileAt, onBombPlaced, onEnd) {
		super({
			x: CharacterPlayerData[id].column * TILE_SIZE + HALF_TILE_SIZE,
			y: CharacterPlayerData[id].row * TILE_SIZE + HALF_TILE_SIZE,
		});

		this.states = {
			[CharacterStateType.IDLE]: {
				type: CharacterStateType.IDLE,
				init: this.handleIdleInit,
				update: this.handleIdleState,
			},
			[CharacterStateType.MOVING]: {
				type: CharacterStateType.MOVING,
				init: this.handleMovingInit,
				update: this.handleMovingState,
			},
			[CharacterStateType.DEATH]: {
				type: CharacterStateType.DEATH,
				init: this.handleDeathInit,
				update: this.handleDeathState,
			},
		};

		this.id = id;
		this.color = CharacterPlayerData[id].color;
		this.frames = getCharacterFrames(this.color);
		this.startPosition = { ...this.position };
		this.getStageCollisionTileAt = getStageCollisionTileAt;
		this.onBombPlaced = onBombPlaced;
		this.onEnd = onEnd;

		this.changeState(CharacterStateType.IDLE, time);
	}

	changeState(newState, time) {
		this.currentState = this.states[newState];
		this.animationFrame = 0;

		this.currentState.init(time);

		this.animationTimer =
			time.previous + this.animation[this.animationFrame][1] * FRAME_TIME;
	}

	resetVelocity = () => {
		this.velocity.x = 0;
		this.velocity.y = 0;
	};

	getCollisionRect = () => ({
		x: this.position.x - HALF_TILE_SIZE / 2,
		y: this.position.y - HALF_TILE_SIZE / 2,
		width: HALF_TILE_SIZE,
		height: HALF_TILE_SIZE,
	});

	// reset(time) {
	// 	this.animationFrame = 0;
	// 	this.direction = Direction.DOWN;
	// 	this.position = { ...this.startPosition };
	// 	this.resetVelocity();
	// 	this.changeState(CharacterStateType.IDLE, time);
	// }

	getCollisionTile(cell) {
		if (
			this.lastBombCell &&
			cell.row === this.lastBombCell.row &&
			cell.column === this.lastBombCell.column
		) {
			return CollisionTile.EMPTY;
		}

		return this.getStageCollisionTileAt(cell);
	}

	getCollisionCoords(direction) {
		switch (direction) {
			case Direction.UP:
				return [
					{
						row: Math.floor((this.position.y - 9) / TILE_SIZE),
						column: Math.floor((this.position.x - 8) / TILE_SIZE),
					},
					{
						row: Math.floor((this.position.y - 9) / TILE_SIZE),
						column: Math.floor((this.position.x + 7) / TILE_SIZE),
					},
				];
			case Direction.LEFT:
				return [
					{
						row: Math.floor((this.position.y - 8) / TILE_SIZE),
						column: Math.floor((this.position.x - 9) / TILE_SIZE),
					},
					{
						row: Math.floor((this.position.y + 7) / TILE_SIZE),
						column: Math.floor((this.position.x - 9) / TILE_SIZE),
					},
				];
			case Direction.RIGHT:
				return [
					{
						row: Math.floor((this.position.y - 8) / TILE_SIZE),
						column: Math.floor((this.position.x + 8) / TILE_SIZE),
					},
					{
						row: Math.floor((this.position.y + 7) / TILE_SIZE),
						column: Math.floor((this.position.x + 8) / TILE_SIZE),
					},
				];
			default:
			case Direction.DOWN:
				return [
					{
						row: Math.floor((this.position.y + 8) / TILE_SIZE),
						column: Math.floor((this.position.x - 8) / TILE_SIZE),
					},
					{
						row: Math.floor((this.position.y + 8) / TILE_SIZE),
						column: Math.floor((this.position.x + 7) / TILE_SIZE),
					},
				];
		}
	}

	applyPowerup(type) {
		switch (type) {
			case CollisionTile.POWERUP_FLAME:
				this.bombStrength += 1;
				break;
			case CollisionTile.POWERUP_BOMB:
				this.bombAmount += 1;
				this.availableBombs = this.bombAmount;
				break;
			case CollisionTile.POWERUP_SPEED:
				this.speedMultiplier += 0.4;
				break;
		}
	}

	shouldBlockMovement(tileCoords) {
		const tileCoordsMatch =
			tileCoords[0].column === tileCoords[1].column &&
			tileCoords[0].row === tileCoords[1].row;
		const collisionTiles = [
			this.getCollisionTile(tileCoords[0]),
			this.getCollisionTile(tileCoords[1]),
		];

		if (
			(tileCoordsMatch && collisionTiles[0] >= CollisionTile.WALL) ||
			(collisionTiles[0] >= CollisionTile.WALL &&
				collisionTiles[1] >= CollisionTile.WALL)
		) {
			return true;
		}
		return false;
	}

	performWallCheck(direction) {
		const collisionCoords = this.getCollisionCoords(direction);

		if (this.shouldBlockMovement(collisionCoords))
			return [this.direction, { x: 0, y: 0 }];

		const counterDirections = CounterDirectionsLookup[direction];
		if (this.getCollisionTile(collisionCoords[0]) >= CollisionTile.WALL) {
			return [
				counterDirections[0],
				{ ...MovementLookup[counterDirections[0]] },
			];
		}
		if (this.getCollisionTile(collisionCoords[1]) >= CollisionTile.WALL) {
			return [
				counterDirections[1],
				{ ...MovementLookup[counterDirections[1]] },
			];
		}

		return [direction, { ...MovementLookup[direction] }];
	}

	getMovement() {
		if (control.isLeft(this.id)) {
			return this.performWallCheck(Direction.LEFT);
		} else if (control.isRight(this.id)) {
			return this.performWallCheck(Direction.RIGHT);
		} else if (control.isDown(this.id)) {
			return this.performWallCheck(Direction.DOWN);
		} else if (control.isUp(this.id)) {
			return this.performWallCheck(Direction.UP);
		}
		return [this.direction, { x: 0, y: 0 }];
	}

	handleMovingInit = () => {
		this.animationFrame = 1;
	};

	handleIdleInit = () => {
		this.resetVelocity();
	};

	handleDeathInit = () => {
		this.resetVelocity();
		this.animation = animations.deathAnimation;
	};

	handleGeneralState = (time) => {
		const [direction, velocity] = this.getMovement();
		if (control.isControlPressed(this.id, Control.ACTION))
			this.handleBombPlacement(time);

		this.animation = animations.moveAnimations[direction];
		this.direction = direction;

		return velocity;
	};

	handleIdleState = (time) => {
		const velocity = this.handleGeneralState(time);
		if (isZero(velocity)) return;

		this.changeState(CharacterStateType.MOVING, time);
	};

	handleMovingState = (time) => {
		this.velocity = this.handleGeneralState(time);
		if (!isZero(this.velocity)) return;

		this.changeState(CharacterStateType.IDLE, time);
	};

	handleDeathState = () => {
		if (animations.deathAnimation[this.animationFrame][1] !== -1) return;

		this.onEnd(this.id);
	};

	handleBombExploded = () => {
		if (this.availableBombs < this.bombAmount) this.availableBombs += 1;
	};

	handleBombPlacement(time) {
		if (this.availableBombs <= 0) return;

		const playerCell = {
			row: Math.floor(this.position.y / TILE_SIZE),
			column: Math.floor(this.position.x / TILE_SIZE),
		};
		if (this.getStageCollisionTileAt(playerCell) !== CollisionTile.EMPTY)
			return;

		this.availableBombs -= 1;
		this.lastBombCell = playerCell;

		this.onBombPlaced(
			playerCell,
			this.bombStrength,
			time,
			this.handleBombExploded
		);
	}

	updatePosition(time) {
		this.position.x +=
			this.velocity.x *
			this.baseSpeedTime *
			this.speedMultiplier *
			time.secondsPassed;
		this.position.y +=
			this.velocity.y *
			this.baseSpeedTime *
			this.speedMultiplier *
			time.secondsPassed;
	}

	updateAnimation(time) {
		if (
			time.previous < this.animationTimer ||
			this.currentState.type === CharacterStateType.IDLE
		)
			return;

		this.animationFrame += 1;
		if (this.animationFrame >= this.animation.length) this.animationFrame = 0;

		this.animationTimer =
			time.previous + this.animation[this.animationFrame][1] * FRAME_TIME;
	}

	resetLastBombCell(playerCell) {
		if (!this.lastBombCell) return;

		// if (
		// 	(playerCell.row === this.lastBombCell.row &&
		// 		playerCell.column === this.lastBombCell.column) ||
		// 	this.collisionMap[this.lastBombCell.row][this.lastBombCell.column] ===
		// 		CollisionTile.BOMB
		// )
		// 	return;

		// this.lastBombCell = undefined;

		if (
			playerCell.row !== this.lastBombCell.row ||
			playerCell.column !== this.lastBombCell.column
		) {
			// The character moved off the bomb cell, set lastBombCell to undefined
			this.lastBombCell = undefined;
		}
	}

	checkFlameTileCollision(playerCell, time) {
		if (
			this.getCollisionTile(playerCell) !== CollisionTile.FLAME ||
			this.currentState.type === CharacterStateType.DEATH
		)
			return;

		this.changeState(CharacterStateType.DEATH, time);
	}

	updateCellUnderneath(time) {
		const playerCell = {
			row: Math.floor(this.position.y / TILE_SIZE),
			column: Math.floor(this.position.x / TILE_SIZE),
		};

		this.resetLastBombCell(playerCell);
		this.checkFlameTileCollision(playerCell, time);
	}

	update(time) {
		this.updatePosition(time);
		this.currentState.update(time);
		this.updateAnimation(time);
		this.updateCellUnderneath(time);
	}

	draw(context, camera) {
		const [frameKey] = this.animation[this.animationFrame];
		const frame = this.frames.get(frameKey);

		drawFrameOrigin(
			context,
			this.image,
			frame,
			Math.floor(this.position.x - camera.position.x),
			Math.floor(this.position.y - camera.position.y),
			[this.direction === Direction.RIGHT ? -1 : 1, 1]
		);

		if (!DEBUG) return;

		// this code puts a box over your character
		// makes it easier to see which player you are
		// drawBox(
		// 	context,
		// 	camera,
		// 	[
		// 		this.position.x - HALF_TILE_SIZE,
		// 		this.position.y - HALF_TILE_SIZE,
		// 		TILE_SIZE - 1,
		// 		TILE_SIZE - 1,
		// 	],
		// 	"#FFFF00"
		// );
		// drawCross(
		// 	context,
		// 	camera,
		// 	{ x: this.position.x, y: this.position.y },
		// 	"#FFF"
		// );
	}
}
