import React from 'react';
//import logo from './logo.svg';
import './App.css';
import _ from 'lodash';

const Timer = (props) => {
	const unitText = props.timerVal > 1 ? "secs" : "sec";
	const timerClass = ["timer"];

	if (props.timerVal <= 10) {
		timerClass.push("timer-red");
	} else if (props.timerVal <= 30) {
		timerClass.push("timer-orange");
	} else {
		timerClass.push("timer-green");
	}

	return (
		<div className={timerClass.join(" ")}>
			Timer: {props.timerVal} {unitText}
		</div>
	);
};

const Stars = (props) => {
	const firstRowStars =
		props.numberOfStars < 4 ? props.numberOfStars : 4;
	const secondRowStars =
		props.numberOfStars > 4
			? props.numberOfStars <= 8 ? (props.numberOfStars - 4) : 4
			: 0;
	const thirdRowStars =
		props.numberOfStars > 8
			? (props.numberOfStars - 8)
			: 0;

	return (
		<div className="col-5">
			<div className="row">
				{
					_.range(firstRowStars).map(
						i => <i key={i} className="fa fa-star"></i>
					)
				}
			</div>
			<div className="row">
				{
					_.range(secondRowStars).map(
						i => <i key={4+i} className="fa fa-star"></i>
					)
				}
			</div>
			<div className="row">
				{
					_.range(thirdRowStars).map(
						i => <i key={8+i} className="fa fa-star"></i>
					)
				}
			</div>
		</div>
	);
};

const Button = (props) => {
	let button;

	switch (props.answerIsCorrect) {
		case true:
			button =
				<button className="btn btn-success"
					onClick={props.acceptAnswer}>
					<i className="fa fa-check"></i>
				</button>;
			break;
		case false:
			button =
				<button className="btn btn-danger">
					<i className="fa fa-times"></i>
				</button>;
			break;
		default:
			button =
				<button className="btn"
					onClick={props.checkAnswer}
					disabled={props.selectedNumbers.length === 0}>
					=
				</button>;
			break;
	}

	return (
		<div className="col-2 text-center">
			{button}
			<br /><br />
			<button className="btn btn-warning btn-sm"
				onClick={props.redraw}
				disabled={props.redraws === 0}>
				<i className="fa fa-refresh"></i> {props.redraws}
			</button>
		</div>
	);
};

const Answer = (props) => {
	return (
		<div className="col-5">
			{props.selectedNumbers.map(
				(number, i) =>
				<span
					key={i}
					onClick={() => props.unselectNumber(number)}>
					{number}
				</span>
			)}
		</div>
	);
};

const Numbers = (props) => {
	const numberClassName = (number) => {
		if (props.usedNumbers.indexOf(number) >= 0) {
			return 'used';
		}

		if (props.selectedNumbers.indexOf(number) >= 0) {
			return 'selected';
		}
	}

	return (
		<div className="card text-center">
			<div>
				{Numbers.list.map(
					(number, i) =>
					<span
						key={i}
						className={numberClassName(number)}
						onClick={() => props.selectNumber(number)}>
						{number}
					</span>
				)}
			</div>
		</div>
	);
};

Numbers.list = _.range(1, 10);

const DoneFrame = (props) => {
	return (
		<div className="text-center">
			<h2>{props.doneStatus}</h2>
			<button className="btn btn-secondary" onClick={props.resetGame}>
				Play Again
			</button>
		</div>
	);
};

class Game extends React.Component {
	static randomNumber = () => Math.floor(Math.random() * 9) + 1;

	static initialState = () => ({
		selectedNumbers: [],
		randomNumberOfStars: Game.randomNumber(),
		usedNumbers: [],
		answerIsCorrect: null,
		redraws: 5,
		doneStatus: null,
		timerId: null,
		timerVal: 60,
	});

	state = Game.initialState();

	resetGame = () => {
		this.setState(Game.initialState());
		this.startTimer();
	};

	selectNumber = (clickedNumber) => {
		if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) {
			return;
		}

		if (this.state.usedNumbers.indexOf(clickedNumber) >= 0) {
			return;
		}

		this.setState(
			prevState => ({
				answerIsCorrect: null,
				selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
			})
		);
	};

	unselectNumber = (clickedNumber) => {
		this.setState(
			prevState => ({
				answerIsCorrect: null,
				selectedNumbers:
					prevState.selectedNumbers.filter(
						number => number !== clickedNumber)
			})
		);
	};

	checkAnswer = () => {
		this.setState(
			prevState => ({
				answerIsCorrect:
					prevState.randomNumberOfStars === prevState.selectedNumbers.reduce(
						(acc, n) => acc + n, 0)
			})
		);
	};

	acceptAnswer = () => {
		this.setState(
			prevState => ({
				usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
				selectedNumbers: [],
				answerIsCorrect: null,
				randomNumberOfStars: Game.randomNumber()
			}), this.updateDoneStatus
		);
	};

	redraw = () => {
		if (this.state.redraws === 0) {
			return;
		}

		this.setState(
			prevState => ({
				usedNumbers: prevState.redraws === 0 ? [] : prevState.usedNumbers,
				selectedNumbers: [],
				answerIsCorrect: null,
				randomNumberOfStars: Game.randomNumber(),
				redraws: prevState.redraws - 1
			}), this.updateDoneStatus
		);
	};

	possibleCombinationSum = (arr, n) => {
		if (arr.indexOf(n) >= 0) { return true; }
		if (arr[0] > n) { return false; }
		if (arr[arr.length - 1] > n) {
			arr.pop();
			return this.possibleCombinationSum(arr, n);
		}

		var listSize = arr.length, combinationsCount = (1 << listSize);
		for (var i = 1; i < combinationsCount ; i++ ) {
			var combinationSum = 0;
			for (var j=0 ; j < listSize ; j++) {
				if (i & (1 << j)) { combinationSum += arr[j]; }
			}
			if (n === combinationSum) { return true; }
		}
		return false;
	};

	possibleSolutions = ({randomNumberOfStars, usedNumbers}) => {
		const possibleNumbers = _.range(1, 10).filter(
			number => usedNumbers.indexOf(number) === -1);

		return this.possibleCombinationSum(possibleNumbers, randomNumberOfStars);
	};

	updateDoneStatus = () => {
		this.setState(
			prevState => {
				if (prevState.usedNumbers.length === 9) {
					this.clearTimer();
					return { doneStatus: 'Done. Nice!' };
				}

				if (prevState.redraws === 0 && !this.possibleSolutions(prevState)) {
					this.clearTimer();
					return { doneStatus: 'Game Over!' };
				}

				if (prevState.timerVal === 0) {
					this.clearTimer();
					return { doneStatus: 'Game Over, Times Up!' };
				}
			}
		);
	};

	startTimer = () => {
		if (this.state.timerVal > 0) {
			this.setState({
				timerId: setInterval( this.timerCountDown.bind(this), 1000)
			});
		}
	};

	clearTimer = () => {
		//console.log("Clearing timer..");
		clearInterval(this.state.timerId);
	};

	timerCountDown = () => {
		if (this.state.timerVal > 0) {
			this.setState(
				prevState => ({
					timerVal: prevState.timerVal - 1
				}), this.updateDoneStatus);
		}
	};

	componentDidMount = () => {
		//this.startTimer();
	};

	componentWillUnMount = () => {
		this.clearTimer();
	};

	render() {
		const {
			selectedNumbers,
			randomNumberOfStars,
			answerIsCorrect,
			usedNumbers,
			redraws,
			doneStatus,
			timerVal
		} = this.state;

		return (
			<div className="container">
				<h3>Play Nine</h3>
				<hr />
				<Timer timerVal={timerVal} />
				<br />
				<div className="row game-board">
					<Stars numberOfStars={randomNumberOfStars} />

					<Button selectedNumbers={selectedNumbers}
						checkAnswer={this.checkAnswer}
						acceptAnswer={this.acceptAnswer}
						redraw={this.redraw}
						redraws={redraws}
						answerIsCorrect={answerIsCorrect} />

					<Answer selectedNumbers={selectedNumbers}
						unselectNumber={this.unselectNumber} />
				</div>
				<br />
				{doneStatus ?
					<DoneFrame resetGame={this.resetGame} doneStatus={doneStatus} /> :
					<Numbers selectedNumbers={selectedNumbers}
						selectNumber={this.selectNumber}
						usedNumbers={usedNumbers} />
				}
			</div>
		);
	}
}

class App extends React.Component {
	render() {
		return (
			<div>
				<Game />
			</div>
		);
	}
}

export default App;
