import { drawTile } from "engine/context.js";
import { MapTile } from "game/constants/LevelData.js";
import { FRAME_TIME, TILE_SIZE } from "game/constants/game.js";

const BLOCK_FRAME_DELAY = 4 * FRAME_TIME;
const NO_FRAMES = 8;

export class Block {
	image = document.querySelector("img#stage");
	animationFrame = MapTile.BLOCK;

	constructor(cell, time, onEnd) {
		this.cell = cell;
		this.onEnd = onEnd;
		this.animationTimer = time.previous + BLOCK_FRAME_DELAY;
	}

	updateAnimation(time) {
		if (time.previous < this.animationTimer) return;

		this.animationFrame += 1;
		this.animationTimer = time.previous + BLOCK_FRAME_DELAY;

		if (this.animationFrame < MapTile.BLOCK + NO_FRAMES) return;

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
			this.animationFrame,
			this.cell.column * TILE_SIZE - camera.position.x,
			this.cell.row * TILE_SIZE - camera.position.y,
			TILE_SIZE
		);
	}
}
