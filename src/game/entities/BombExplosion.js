import { drawTile } from "engine/context.js";
import {
	BASE_BOTTOM_LAST_FRAME,
	BASE_FRAME,
	BASE_HORIZONTAL_FRAME,
	BASE_LEFT_LAST_FRAME,
	BASE_RIGHT_LAST_FRAME,
	BASE_TOP_LAST_FRAME,
	BASE_VERTICAL_FRAME,
	EXPLOSION_ANIMATION,
	EXPLOSION_FRAME_DELAY,
	FLAME_ANIMATION,
} from "game/constants/bombs.js";
import { TILE_SIZE } from "game/constants/game.js";

export class BombExplosion {
	image = document.querySelector("img#stage");
	animationFrame = 0;

	constructor(cell, flameCells, time, onEnd) {
		this.cell = cell;
		this.flameCells = flameCells;
		this.animationTimer = time.previous + EXPLOSION_FRAME_DELAY;
		this.onEnd = onEnd;
	}

	getBaseFrame(flameCell) {
		if (!flameCell.isVertical && !flameCell.isLast) {
			return BASE_HORIZONTAL_FRAME;
		} else if (flameCell.isVertical && !flameCell.isLast) {
			return BASE_VERTICAL_FRAME;
		} else if (!flameCell.isVertical && flameCell.isLast) {
			return flameCell.cell.column < this.cell.column
				? BASE_LEFT_LAST_FRAME
				: BASE_RIGHT_LAST_FRAME;
		} else if (flameCell.isVertical && flameCell.isLast) {
			return flameCell.cell.row < this.cell.row
				? BASE_TOP_LAST_FRAME
				: BASE_BOTTOM_LAST_FRAME;
		}
	}

	updateAnimation(time) {
		if (time.previous < this.animationTimer) return;

		this.animationFrame += 1;
		this.animationTimer = time.previous + EXPLOSION_FRAME_DELAY;

		if (this.animationFrame < EXPLOSION_ANIMATION.length) return;

		this.animationFrame = 0;
		this.onEnd(this);
	}

	update(time) {
		this.updateAnimation(time);
	}

	draw(context, camera) {
		drawTile(
			context,
			this.image,
			BASE_FRAME + EXPLOSION_ANIMATION[this.animationFrame],
			this.cell.column * TILE_SIZE - camera.position.x,
			this.cell.row * TILE_SIZE - camera.position.y,
			TILE_SIZE
		);

		for (const flameCell of this.flameCells) {
			const baseFrame = this.getBaseFrame(flameCell);

			drawTile(
				context,
				this.image,
				baseFrame + FLAME_ANIMATION[this.animationFrame],
				flameCell.cell.column * TILE_SIZE - camera.position.x,
				flameCell.cell.row * TILE_SIZE - camera.position.y,
				TILE_SIZE
			);
		}
	}
}
