import View from "./graphics/view.js";
import Button from "./graphics/button.js";
import WinAnimation from "./graphics/winAnimation.js";
import c from "./config.json";

class Game {
	constructor() {
		this.winState = false;
		this.ticker;

		this.textures = c.textures;
		
		this.reels = [];
		this.reelCount = c.reelCount;
		this.rounds = c.rounds;

		this.view = new View();
		this.app = this.setup();

		this.winContainer;
		this.winAnimation;

		this.button = this.addSpinButton();
	}

	setup() {
		let app = this.view.createApp(...c.appSize);
		let background = this.view.createSprite(this.textures.background, app.stage);
		let reelContainer = this.view.createContainer(app.stage, ...c.reelCoords);
		
		let { symbols } = this.textures;
		let reelPadding = 0;

		// Create reels
		while(this.reels.length < this.reelCount) {
			let x = c.symbolSize * this.reels.length + reelPadding;
			let reel = this.view.createReel(x, c.symbolSize, c.maskHeight, symbols, reelContainer);
				reel.name = "reel";
			this.reels.push(reel);
			reelPadding += c.reelPadding;
		}

		// Set visible rectangular area for all reels
		let maskX = c.maskPadding,
			maskY = 0,
			maskWidth = c.maskWidth,
			maskHeight = c.maskHeight;

		let maskCoordinates = [maskX, maskY, maskWidth, maskHeight];
		let containerMask = this.view.createRect(app.stage, maskCoordinates);

		reelContainer.mask = containerMask;
		reelContainer.addChild(containerMask);

		// Create container for win animation
		this.winContainer = this.view.createContainer(reelContainer);

		return app;
	}

	addSpinButton() {
		let name = "buttonContainer",
			{ buttons } = this.textures,
			{ stage } = this.app;
		
		let callback = () => {
			this.spin(this.reels, this.app);
			if(this.winAnimation) {
				this.winAnimation.clear(this.app, this.winContainer);
			}
		};

		return new Button(...c.buttonCoords, buttons, stage, callback, name);
	}

	spin(reel, app) {
		// Generate resulting combination for the spin
		let setResultCombination = () => {
			let result = {
				win: false,
				symbols: [],
			};

			let rand = Math.ceil(Math.random() * 10);
			let symbols = Object.keys(this.textures.symbols);

			// Generate "wild", "regular win" or "lose" result based on value of the "rand" variable
			if(rand > c.wildThreshold) {
				result.win = true;

				while(result.symbols.length < this.reelCount) {
					result.symbols.push(symbols[0]);
				}
			} else if(rand > c.winThreshold) {
				result.win = true;

				// If "regular win" situation, get a random symbol (except "wild") for the win line
				let randSymbol = symbols[Math.floor(Math.random() * (symbols.length - 1)) + 1];
				while(result.symbols.length < this.reelCount) {
					result.symbols.push(randSymbol);
				}
			} else {
				result.win = false;

				while(result.symbols.length < this.reelCount) {
					let randSymbol = symbols[Math.floor(Math.random() * symbols.length)];

					// Make sure the resulting line contains 2 or less of the same symbol
					if(result.symbols.filter(item => item === randSymbol).length < this.reelCount - 1) {
						result.symbols.push(randSymbol);
					} else {
						continue;
					}

				}
			}

			return result;
		}

		let combo = setResultCombination();
		this.winState = combo.win;

		// Set parameters for the spinning: velocity, "motion" filter, and resulting symbols
		let reels = reel.map((item, i) => {
			let reel = item.children[0];
				reel.vy = c.symbolHeight / 4;
				reel.filters = [this.view.createVerticalBlur()];
				reel.resultSprite = reel.children.find((sprite) => 
					sprite.name === combo.symbols[i]
				);				

			return reel;
		});

		this.ticker = () => this.loop(reels, app);
		app.ticker.add(this.ticker);
	}

	loop(reels, app) {
		// Spinning reels
		reels.forEach((reel, i) => {
			reel.y += reel.vy;

			// If a symbol goes beyond the visible area, put it on top of the reel
			if(!(reel.y % c.symbolHeight)) {
				reel.children.forEach((item) => {
					if(item.getGlobalPosition().y > c.maskHeight) {
						reel.parent.bottom -= c.symbolHeight;
						item.y = reel.parent.bottom;
					}
				});
				--this.rounds;
			}
		});

		if(this.rounds <= 0) {
			let stop = (item) => {
				item.vy = 0;
				item.filters = [];
			}

			// Sequential stop for the reels
			reels.forEach((reel, i) => {
				let { y } = reel.resultSprite.getGlobalPosition();

				if(!i && y === c.winY) {
					stop(reel);
				} else if(i && !reels[i-1].vy && y === c.winY) {
					stop(reel);

					// On the last reel remove the ticker and activate the spin button
					if(i === this.reelCount - 1) {
						app.ticker.remove(this.ticker);
						this.rounds = c.rounds;
						this.button.show();

						// If winState is true, start win animation
						if(this.winState) {
							this.winAnimation = new WinAnimation(
								this.app,
								this.winContainer,
								c.maskPadding,
								c.maskWidth,
								c.winLineY
							);
						}
					}
				}
			});
		}
	}
}

// Load textures
PIXI.loader
	.add('images', './img/images.json')
	.load(() => new Game());
