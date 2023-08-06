
import { Board } from '../src/Board.js';
import { Pawn } from '../src/Pawn.js';
import { tiles_data_white, coords_data_white, tiles_data_black, coords_data_black, boundary_data } from "./test.data.js";

let expect = chai.expect;

describe('Pawn Class Tests:', () => {
    describe('getValidMoves()', () => {
        it('C2, white, cannot take should return [C3, C4]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C3', 'C4'];
            board.addPiece(new Pawn(board, 'C2', 'white'));
            let pawn = board.getPieceFromCoord('C2');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C2, white, can take on D3 should return [C3, C4, D3]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C3', 'C4', 'D3'];
            board.addPiece(new Pawn(board, 'C2', 'white'));
            board.addPiece(new Pawn(board, 'D3', 'black'));
            let pawn = board.getPieceFromCoord('C2');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C2, white, can take on B2 should return [C3, C4, B2]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C3', 'C4', 'B2'];
            board.addPiece(new Pawn(board, 'C2', 'white'));
            board.addPiece(new Pawn(board, 'B2', 'black'));
            let pawn = board.getPieceFromCoord('C2');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C2, white, can take on D3 en passant should return [C3, C4, D3]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C3', 'C4', 'D3'];
            board.addPiece(new Pawn(board, 'C2', 'white'));
            board.addPiece(new Pawn(board, 'D2', 'black'));
            let pawn = board.getPieceFromCoord('C2');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C2, white, can take on B2 en passant should return [C3, C4, B2]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C3', 'C4', 'B2'];
            board.addPiece(new Pawn(board, 'C2', 'white'));
            board.addPiece(new Pawn(board, 'B1', 'black'));
            let pawn = board.getPieceFromCoord('C2');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C3, white, cannot take should return [C4]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C4'];
            board.addPiece(new Pawn(board, 'C3', 'white'));
            let pawn = board.getPieceFromCoord('C3');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C3, white, can take on D4 should return [C4, D4]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C4', 'D4'];
            board.addPiece(new Pawn(board, 'C3', 'white'));
            board.addPiece(new Pawn(board, 'D4', 'black'));
            let pawn = board.getPieceFromCoord('C3');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C3, white, can take on B3 should return [C4, B3]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C4', 'B3'];
            board.addPiece(new Pawn(board, 'C3', 'white'));
            board.addPiece(new Pawn(board, 'B3', 'black'));
            let pawn = board.getPieceFromCoord('C3');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C3, white, can take on D4 en passant should return [C4, D4]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C4', 'D4'];
            board.addPiece(new Pawn(board, 'C3', 'white'));
            board.addPiece(new Pawn(board, 'D3', 'black'));
            let pawn = board.getPieceFromCoord('C3');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C3, white, can take on B3 en passant should return [C4, B3]', () => {
            let board = new Board(undefined, 'white', tiles_data_white, coords_data_white);
            let expected = ['C4', 'B3'];
            board.addPiece(new Pawn(board, 'C3', 'white'));
            board.addPiece(new Pawn(board, 'B2', 'black'));
            let pawn = board.getPieceFromCoord('C3');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });

        it('C7, black, cannot take should return [C6, C5]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C6', 'C5'];
            board.addPiece(new Pawn(board, 'C7', 'black'));
            let pawn = board.getPieceFromCoord('C7');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C7, black, can take on D7 should return [C6, C5, D7]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C6', 'C5', 'D7'];
            board.addPiece(new Pawn(board, 'C7', 'black'));
            board.addPiece(new Pawn(board, 'D7', 'white'));
            let pawn = board.getPieceFromCoord('C7');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C7, black, can take on B6 should return [C6, C5, B6]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C6', 'C5', 'B6'];
            board.addPiece(new Pawn(board, 'C7', 'black'));
            board.addPiece(new Pawn(board, 'B6', 'white'));
            let pawn = board.getPieceFromCoord('C7');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C7, black, can take on D7 en passant should return [C6, C5, D7]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C6', 'C5', 'D7'];
            board.addPiece(new Pawn(board, 'C7', 'black'));
            board.addPiece(new Pawn(board, 'D8', 'white'));
            let pawn = board.getPieceFromCoord('C7');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C7, black, can take on B6 en passant should return [C6, C5, B6]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C6', 'C5', 'B6'];
            board.addPiece(new Pawn(board, 'C7', 'black'));
            board.addPiece(new Pawn(board, 'B7', 'white'));
            let pawn = board.getPieceFromCoord('C7');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C6, black, cannot take should return [C5]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C5'];
            board.addPiece(new Pawn(board, 'C6', 'black'));
            let pawn = board.getPieceFromCoord('C6');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C6, black, can take on D6 should return [C5, D6]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C5', 'D6'];
            board.addPiece(new Pawn(board, 'C6', 'black'));
            board.addPiece(new Pawn(board, 'D6', 'white'));
            let pawn = board.getPieceFromCoord('C6');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C6, black, can take on B5 should return [C5, B5]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C5', 'B5'];
            board.addPiece(new Pawn(board, 'C6', 'black'));
            board.addPiece(new Pawn(board, 'B5', 'white'));
            let pawn = board.getPieceFromCoord('C6');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C6, black, can take on D6 en passant should return [C5, D6]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C5', 'D6'];
            board.addPiece(new Pawn(board, 'C6', 'black'));
            board.addPiece(new Pawn(board, 'D7', 'white'));
            let pawn = board.getPieceFromCoord('C6');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
        it('C6, black, can take on B5 en passant should return [C5, B5]', () => {
            let board = new Board(undefined, 'black', tiles_data_black, coords_data_black);
            let expected = ['C5', 'B5'];
            board.addPiece(new Pawn(board, 'C6', 'black'));
            board.addPiece(new Pawn(board, 'B6', 'white'));
            let pawn = board.getPieceFromCoord('C6');
            let result = pawn.getValidMoves(undefined, boundary_data);
            expect(result).deep.to.equal(expected);
        });
    });
});