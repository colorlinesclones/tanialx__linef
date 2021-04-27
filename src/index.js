import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Board from './board.js'
import Score from './score';

class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <div>
                    <div className="score-board">
                        <span>Score: </span>
                        <Score score="0" />
                    </div>
                    <Board w='9' h='9' />
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
