class Button {
	constructor(...params) {
		this.button = this.create(...params);
	}

	create(x, y, images, target, callback, name)  {
		let { textures } = PIXI.loader.resources.images;

		let container = new PIXI.Container();
			container.x = x;
			container.y = y;
			container.name = name;
		target.addChild(container);

		let background = new PIXI.Sprite(textures[images.disabled]);
			container.addChild(background);

		let button = new PIXI.Sprite(textures[images.enabled]);
			button.interactive = true;
			button.buttonMode = true;

			button.on("pointerdown", () => {
				button.visible = false;
				callback();
			});
		container.addChild(button);

		return button;
	}

	show() {
		this.button.visible = true;
	}
}

export default Button;
