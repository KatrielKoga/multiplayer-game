export default function createGame() {
	const state = {
		players: {},
		fruits: {},
		screen: {
			width: 20,
			height: 20,
		},
	};

	const observers = [];

	function start() {
		const frequency = 2000;

		setInterval(addFruit, frequency);
	}

	function subscribe(observerFunction) {
		observers.push(observerFunction);
		console.log(observers);
	}

	function unsubscribe() {
		observers.length = 0;
	}

	function notifyAll(command) {
		for (const observerFunction of observers) {
			observerFunction(command);
		}
	}

	function setState(newState) {
		Object.assign(state, newState);
	}

	function addPlayer(command) {
		const playerId = command.playerId;
		const playerX =
			'playerX' in command
				? command.playerX
				: Math.floor(Math.random() * state.screen.width);
		const playerY =
			'playerY' in command
				? command.playerY
				: Math.floor(Math.random() * state.screen.height);
		const points = 0;

		state.players[playerId] = {
			x: playerX,
			y: playerY,
			points,
		};

		notifyAll({
			type: 'add-player',
			playerId,
			playerX,
			playerY,
			points,
		});
	}

	function removePlayer(command) {
		const playerId = command.playerId;

		delete state.players[playerId];

		notifyAll({
			type: 'remove-player',
			playerId,
		});
	}

	function addFruit(command) {
		const fruitId = command
			? command.fruitId
			: Math.floor(Math.random() * 1000000);
		const fruitX = command
			? command.fruitX
			: Math.floor(Math.random() * state.screen.width);
		const fruitY = command
			? command.fruitY
			: Math.floor(Math.random() * state.screen.height);

		state.fruits[fruitId] = {
			x: fruitX,
			y: fruitY,
		};

		notifyAll({
			type: 'add-fruit',
			fruitId,
			fruitX,
			fruitY,
		});
	}

	function removeFruit(command) {
		const fruitId = command.fruitId;

		delete state.fruits[fruitId];

		notifyAll({
			type: 'remove-fruit',
			fruitId,
		});
	}

	function movePlayer(command) {
		notifyAll(command);

		const acceptedMoves = {
			ArrowUp(player) {
				if (player.y - 1 >= 0) {
					player.y = player.y - 1;
				} else {
					player.y = state.screen.height - 1;
				}
			},
			ArrowDown(player) {
				if (player.y + 1 < state.screen.height) {
					player.y = player.y + 1;
				} else {
					player.y = 0;
				}
			},
			ArrowLeft(player) {
				if (player.x - 1 >= 0) {
					player.x = player.x - 1;
				} else {
					player.x = state.screen.width - 1;
				}
			},
			ArrowRight(player) {
				if (player.x + 1 < state.screen.width) {
					player.x = player.x + 1;
				} else {
					player.x = 0;
				}
			},
		};

		const keyPressed = command.keyPressed;
		const playerId = command.playerId;
		const player = state.players[command.playerId];
		const moveFunction = acceptedMoves[keyPressed];
		if (player && moveFunction) {
			moveFunction(player);
			checkFuitCollision(playerId);
		}
	}

	function checkFuitCollision(playerId) {
		const player = state.players[playerId];

		for (const fruitId in state.fruits) {
			const fruit = state.fruits[fruitId];

			if (player.x === fruit.x && player.y === fruit.y) {
				removeFruit({ fruitId });
				state.players[playerId].points++;
			}
		}
	}

	return {
		addPlayer,
		removePlayer,
		addFruit,
		removeFruit,
		movePlayer,
		setState,
		subscribe,
		notifyAll,
		start,
		unsubscribe,
		state,
	};
}
