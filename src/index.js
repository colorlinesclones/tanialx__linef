import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Board from './board.js'

class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
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
