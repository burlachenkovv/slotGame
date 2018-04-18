class View {
	createApp(width, height) {
		let application = new PIXI.Application({
			width: width,
			height: height,
			backgroundColor: 0xFFFFFF,
		});
		document.body.appendChild(application.view);
		
		return application;
	}

	createContainer(app, x = 0, y = 0) {
		let container = new PIXI.Container();
			container.x = x;
			container.y = y;
		app.addChild(container);

		return container
	}

	createSprite(image, app, name) {
		let sprite = new PIXI.Sprite(PIXI.loader.resources["images"].textures[image]);
			sprite.name = (name) ? name : null;
		app.addChild(sprite);

		return sprite;
	}

	createReel(x, width, height, textures, app) {
		let container = new PIXI.Container();
			container.width = width;
			container.height = height;
			container.x = x;
			container.y = 0;
			container.bottom = null;
		app.addChild(container);

		let innerContainer = new PIXI.Container();
		container.addChild(innerContainer);

		let symbols = Object.entries(textures).sort(() => Math.random() - 0.5);
			symbols.forEach((item, i) => {
				let symbol = this.createSprite(item[1], innerContainer, item[0]);
					symbol.y = height - symbol.height * symbols.length + symbol.height * i;
					
					if(!i) container.bottom = symbol.y;
			});

		return container;
	}

	createRect(container, coords) {
		let rectangle = new PIXI.Graphics();
			rectangle.clear();
			rectangle.drawRect(...coords);
		container.addChild(rectangle);

		return rectangle;
	}

	createVerticalBlur() {
		let blur = new PIXI.filters.BlurFilter();
			blur.blurX = 0;
			blur.blurY = 10;

		return blur;
	}
}

export default View;