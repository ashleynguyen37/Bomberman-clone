import { TILE_SIZE } from "./game.js";

export const STAGE_MAP_MAX_SIZE = 64 * TILE_SIZE;

export const playerStartCoords = [
	[1, 2],
	[2, 2],
	[1, 3],
	[1, 13],
	[1, 14],
	[2, 14],
	[10, 2],
	[11, 2],
	[11, 3],
	[10, 14],
	[11, 13],
	[11, 14],
	[5, 8],
	[6, 8],
	[7, 8],
	[5, 7],
	[5, 9],
	[7, 7],
	[7, 9],
];

export const MapTile = {
	OUTER_WALL: 29,
	FLOOR: 59,
	WALL: 30,
	BLOCK: 103,
};

export const CollisionTile = {
	EMPTY: 0,
	POWERUP_FLAME: 1,
	POWERUP_BOMB: 2,
	POWERUP_SPEED: 3,
	FLAME: 10,
	WALL: 20,
	BOMB: 21,
	BLOCK: 30,
};

export const MapToCollisionTileLookup = {
	[MapTile.FLOOR]: CollisionTile.EMPTY,
	[MapTile.WALL]: CollisionTile.WALL,
	[MapTile.OUTER_WALL]: CollisionTile.WALL,
	[MapTile.BLOCK]: CollisionTile.BLOCK,
};

export const stageData = {
	maxBlocks: 60,
	powerups: {
		[CollisionTile.POWERUP_FLAME]: 8,
		[CollisionTile.POWERUP_BOMB]: 8,
		[CollisionTile.POWERUP_SPEED]: 4,
	},
	tiles: [
		[29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 29],
		[29, 30, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 30, 29],
		[29, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 29],
		[29, 30, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 30, 29],
		[29, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 29],
		[29, 30, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 30, 29],
		[29, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 29],
		[29, 30, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 30, 29],
		[29, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 29],
		[29, 30, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 30, 29],
		[29, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 59, 30, 29],
		[29, 30, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 30, 29],
		[29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 29],
		[29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29],
	],
};
