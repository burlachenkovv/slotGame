// Decided to skip adding "You won" text to stick to minimalistic design of the win animation

class winAnimation {
	constructor(...params) {
		this.lineStep = 60;

		this.line;
		this.shine;

		this.loop;
		this.currentX;

		this.drawAnimation(...params);
	}

	drawAnimation(app, container, from, to, y) {
		// Create win line
		let line = new PIXI.Graphics();
			line.filters = [new PIXI.filters.GlowFilter(10, 2, 0, 0xfef357, 0.5)];
			line.name = "winLine";
		container.addChild(line);

		this.currentX = from;
		this.line = line;
		this.loop = () => this.drawLoop(from, to, y, app);
		app.ticker.add(this.loop);

		// Create shine for the each win symbol
		this.shine = new PIXI.Container();
		this.shine.alpha = 0.2;
		this.shine.destination = true;
		container.addChild(this.shine);

		let reels = container.parent.children.filter((item) => item.name === "reel");
		reels.forEach((item) => {
			this.drawShine(container, item.x + item.width / 2);
		});

	}

	drawShine(container, x) {
		let shine = new PIXI.Sprite(PIXI.loader.resources["images"].textures["light.png"]);
			shine.x = x;
			shine.y = 240;
			shine.width = 200;
			shine.height = 200;
			shine.anchor.set(0.5);

		this.shine.addChild(shine);
	}

	drawLoop(from, to, y, app) {
		if(this.currentX < to) {
			this.currentX += this.lineStep;
			this.line.clear();

			this.line.lineStyle(5, 0xffffff, 0.5)
				.moveTo(from, y)
				.lineTo(this.currentX, y);
		}

		if(this.shine.destination) {
			this.shine.alpha += 0.008;
			this.shine.destination = (this.shine.alpha < 0.7) ? true : false;
		} else {
			this.shine.alpha -= 0.008;
			this.shine.destination = (this.shine.alpha > 0) ? false : true;
		}
	}

	clear(app, container) {
		container.removeChildren();
		app.ticker.remove(this.loop);
	}
}

export default winAnimation;
