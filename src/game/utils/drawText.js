import { drawFrame } from "engine/context.js";

const frames = new Map([
	["alpha-0", [16, 8, 8, 8]],
	["alpha-1", [24, 8, 8, 8]],
	["alpha-2", [32, 8, 8, 8]],
	["alpha-3", [40, 8, 8, 8]],
	["alpha-4", [48, 8, 8, 8]],
	["alpha-5", [56, 8, 8, 8]],
	["alpha-6", [64, 8, 8, 8]],
	["alpha-7", [72, 8, 8, 8]],
	["alpha-8", [80, 8, 8, 8]],
	["alpha-9", [88, 8, 8, 8]],
	["alpha-:", [96, 8, 8, 8]],
	["alpha--", [16, 32, 8, 8]],
	["alpha-!", [24, 32, 8, 8]],
	["alpha-/", [32, 32, 8, 8]],
]);

const fontImage = document.querySelector("img#font");

export function drawText(context, text, baseX, baseY) {
	let x = 0;

	for (const char of text) {
		if (char !== " ") {
			drawFrame(
				context,
				fontImage,
				frames.get(`alpha-${char}`),
				baseX + x,
				baseY
			);
		}

		x += 8;
	}
}
