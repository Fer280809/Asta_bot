export default class TicTacToe {
  constructor(playerX = 'x', playerO = 'o') {
    this.playerX = playerX;
    this.playerO = playerO;
    this._currentTurn = false; // false = X, true = O
    this.turns = 0;
    this._x = 0; // Bitboard para X
    this._o = 0; // Bitboard para O
  }

  get board() {
    return this._x | this._o;
  }

  get currentTurn() {
    return this._currentTurn ? this.playerO : this.playerX;
  }

  get enemy() {
    return this._currentTurn ? this.playerX : this.playerO;
  }

  static check(state) {
    // Patrones de victoria en bitboard
    const winningStates = [
      0b111000000, // fila superior
      0b000111000, // fila media
      0b000000111, // fila inferior
      0b100100100, // columna izquierda
      0b010010010, // columna central
      0b001001001, // columna derecha
      0b100010001, // diagonal \
      0b001010100  // diagonal /
    ];

    for (const win of winningStates) {
      if ((state & win) === win) return true;
    }
    return false;
  }

  /**
   * Realiza un turno
   * @param player true = O, false = X
   * @param pos posición 0-8
   * @returns {number} 
   *  - 1 = movimiento exitoso
   *  - 0 = posición inválida
   *  - -1 = posición ocupada
   *  - -2 = no es el turno del jugador
   *  - -3 = el juego ya terminó
   */
  turn(player = false, pos = 0) {
    if (this.winner !== null) return -3;
    if (player !== this._currentTurn) return -2;
    if (pos < 0 || pos > 8) return 0;
    if (this.board & (1 << pos)) return -1;

    // Realizar movimiento
    this[this._currentTurn ? '_o' : '_x'] |= (1 << pos);
    this._currentTurn = !this._currentTurn;
    this.turns++;
    return 1;
  }

  /**
   * @returns {null|'x'|'o'} ganador
   */
  get winner() {
    const x = TicTacToe.check(this._x);
    const o = TicTacToe.check(this._o);
    
    if (x) return this.playerX;
    if (o) return this.playerO;
    return null;
  }

  /**
   * Renderiza el tablero
   * @returns {Array} tablero con X, O y números
   */
  render() {
    const result = [];
    for (let i = 0; i < 9; i++) {
      if (this._x & (1 << i)) {
        result.push('X');
      } else if (this._o & (1 << i)) {
        result.push('O');
      } else {
        result.push(i + 1);
      }
    }
    return result;
  }

  /**
   * Renderiza el tablero como string
   */
  toString() {
    const board = this.render();
    return `
${board.slice(0, 3).join(' | ')}
---------
${board.slice(3, 6).join(' | ')}
---------
${board.slice(6).join(' | ')}
`.trim();
  }
}