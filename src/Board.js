import { Tile } from "./Tile.js";
import { Coordinate } from "./Coordinate.js";
import { FENLoader } from "./FENLoader.js";
import { Pawn } from "./pieces/Pawn.js";
import { Knight } from "./pieces/Knight.js";
import { Bishop } from "./pieces/Bishop.js";
import { Rook } from "./pieces/Rook.js";
import { Queen } from "./pieces/Queen.js";
import { King } from "./pieces/King.js";
import { Raycaster } from "./Raycaster.js";

export class Board 
{

    coordinates = [];
    tiles = [];
    validTiles = [];
    selectedTile = undefined;
    pieces = [];
    halfMoveClock = 0;
    fullMoveClock = 1;
    awaitingPromotion = false;
    hasEnPassant = false;
    enPassant = '';

    previousBoards = [];
    

    constructor (scene, colour, tiles_data, coords_data) {
        this.colour = colour;
        this.scene = scene;

        if (this.scene === undefined && (tiles_data === undefined || coords_data === undefined)) {
            console.warn('The scene and either the tile or coordinate data is not provided to board constructor.');
            return undefined;
        }

        this.buildTiles();

        this.buildCoordinates();
    }

    buildTiles = function () {
        if (this.tiles.length > 0) {
            this.tiles.forEach(tile => {
                tile.destroy();
            });
        }
        this.tiles = [];
        const tiles_data = this.scene.cache.json.get('json_tile_data_' + this.colour);

        tiles_data.forEach((tile) => {
            this.tiles.push(new Tile(this, Number(tile.x), Number(tile.y), tile.colour, tile.coordinate, tile.isPawnStartingTile, this.scene));
        }, this);

        let temp_pieces = this.pieces;
        this.pieces = [];
        temp_pieces.forEach(piece => {
            piece.take();
            switch (piece.type) {
                case 'pawn':
                    this.addPiece(new Pawn(piece.board, piece.coordinate, piece.colour, piece.scene));
                    break;
                case 'knight':
                    this.addPiece(new Knight(piece.board, piece.coordinate, piece.colour, piece.scene));
                    break;
                case 'bishop':
                    this.addPiece(new Bishop(piece.board, piece.coordinate, piece.colour, piece.scene));
                    break;
                case 'rook':
                    this.addPiece(new Rook(piece.board, piece.coordinate, piece.colour, piece.scene));
                    break;
                case 'queen':
                    this.addPiece(new Queen(piece.board, piece.coordinate, piece.colour, piece.scene));
                    break;
                case 'king':
                    this.addPiece(new King(piece.board, piece.coordinate, piece.colour, piece.scene));
                    break;
            }
        });

        this.previousBoards.push(this.toFEN().split(' ')[0]);
    }

    buildCoordinates = function (colour) {
        if (this.coordinates.length > 0) {
            this.coordinates.forEach(coord => {
                coord.destroy();
            });
        }
        this.coordinates = [];
        const coords_data = this.scene.cache.json.get('json_coord_data_' + this.colour);

        coords_data.forEach((coord) => {
            this.coordinates.push(new Coordinate(coord.x, coord.y, coord.content, this.scene));
        }); 
    }

    getTileFromCoord = function (coord) {
        let result;
        this.tiles.forEach((tile) => {
            if (tile.coordinate === coord)
                result = tile;
        });
        return result;
    }

    getPositionsFromCoord = function (coord) {
        return {
            x: this.getTileFromCoord(coord).x,
            y: this.getTileFromCoord(coord).y
        };
    }

    getTileFromPositions = function (x, y) {
        let result;
        this.tiles.forEach((tile) => {
            if (tile.x === x && tile.y === y)
                result = tile;
        });
        return result;
    }

    getCoordFromPositions = function (x, y) {
        let tile = this.getTileFromPositions(x, y);
        if (tile === undefined)
            return undefined;
        return tile.coordinate;
    }

    addPiece = function (piece) {
        this.pieces.push(piece);
        this.getTileFromCoord(piece.coordinate).setPiece(piece);
    }

    removePiece = function (piece) {
        piece.take();
        const indexOfPiece = this.pieces.indexOf(piece);
        this.pieces.splice(indexOfPiece, 1);
        this.getTileFromCoord(piece.coordinate).removePiece();
    }

    tempRemovePiece = function (piece) {
        const indexOfPiece = this.pieces.indexOf(piece);
        this.pieces.splice(indexOfPiece, 1);
        this.getTileFromCoord(piece.coordinate).removePiece();
    }

    getPieceFromCoord = function (coordinate) {
        let result = undefined;
        this.pieces.forEach((piece) => {
            if (piece.coordinate === coordinate)
                result = piece;
        });
        
        return result;
    }

    clear = function () {
        this.pieces.forEach(piece => piece.take());
        this.pieces = [];
        this.tiles.forEach((tile) => {
            tile.removePiece();
        });
    }

    clearValidTiles = function () {
        this.tiles.forEach((tile) => {
            if (tile.valid === true)
                tile.setValid(false);
        });
        this.validTiles = [];
    }

    findKing = function (colour) {
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces[i];
            if (piece.type === 'king' && piece.colour === colour)
                return piece;
        }
        return undefined;
    }

    resultsInMateWhite = function (piece, coordinate) {
        const destinationTile = this.getTileFromCoord(coordinate);
        const originTile = this.getTileFromCoord(piece.coordinate);
        const pieceAtCoordinate = this.getPieceFromCoord(coordinate);
        piece.moveTo(coordinate);
        destinationTile.setPiece(piece);

        const resultsInMate = this.isMateWhite();

        piece.moveTo(originTile.coordinate);
        originTile.setPiece(piece);
        if (pieceAtCoordinate !== undefined)
            destinationTile.setPiece(pieceAtCoordinate);
        else
            destinationTile.removePiece();
        return resultsInMate;
    }

    resultsInMateBlack = function (piece, coordinate) {
        const destinationTile = this.getTileFromCoord(coordinate);
        const originTile = this.getTileFromCoord(piece.coordinate);
        const pieceAtCoordinate = this.getPieceFromCoord(coordinate);
        piece.moveTo(coordinate);
        destinationTile.setPiece(piece);

        const resultsInMate = this.isMateBlack();

        piece.moveTo(originTile.coordinate);
        originTile.setPiece(piece);
        if (pieceAtCoordinate !== undefined)
            destinationTile.setPiece(pieceAtCoordinate);
        else
            destinationTile.removePiece();
        return resultsInMate;
    }

    isMateWhite = function () {
        const king = this.findKing('white');
        const legalMoves = king.getLegalMoves();
        return this.isCheckWhite() && legalMoves.length === 0
    }

    isMateBlack = function () {
        const king = this.findKing('black');
        const legalMoves = king.getLegalMoves();
        return this.isCheckBlack() && legalMoves.length === 0
    }

    resultsInCheckWhite = function (piece, coordinate) {
        const destinationTile = this.getTileFromCoord(coordinate);
        const originTile = this.getTileFromCoord(piece.coordinate);
        const pieceAtCoordinate = this.getPieceFromCoord(coordinate);
        piece.moveTo(coordinate);
        destinationTile.setPiece(piece);
        let resultsInCheck = false;
        if (this.isCheckWhite())
            resultsInCheck = true;
        piece.moveTo(originTile.coordinate);
        originTile.setPiece(piece);
        if (pieceAtCoordinate !== undefined)
            destinationTile.setPiece(pieceAtCoordinate);
        else
            destinationTile.removePiece();
        return resultsInCheck;
    }

    resultsInCheckBlack = function (piece, coordinate) {
        const destinationTile = this.getTileFromCoord(coordinate);
        const originTile = this.getTileFromCoord(piece.coordinate);
        const pieceAtCoordinate = this.getPieceFromCoord(coordinate);
        piece.moveTo(coordinate);
        destinationTile.setPiece(piece);
        originTile.removePiece();
        let resultsInCheck = false;
        if (this.isCheckBlack())
            resultsInCheck = true;
        piece.moveTo(originTile.coordinate);
        originTile.setPiece(piece);
        if (pieceAtCoordinate !== undefined)
            destinationTile.setPiece(pieceAtCoordinate);
        else
            destinationTile.removePiece();
        return resultsInCheck;
    }

    isCheck = function () {
        return this.isCheckWhite() || this.isCheckBlack();
    }

    isCheckWhite = function () {
        const king = this.findKing('white');
        if (king === undefined)
            return false;
        return this.isCheckPawn(king) || this.isCheckKnight(king) || this.isCheckBishop(king) ||
            this.isCheckRook(king) || this.isCheckQueen(king);
    }

    isCheckBlack = function () {
        const king = this.findKing('black');
        if (king === undefined)
            return false;
        return this.isCheckPawn(king) || this.isCheckKnight(king) || this.isCheckBishop(king) ||
        this.isCheckRook(king) || this.isCheckQueen(king);
    }

    isCheckPawn = function (king) {
        const currentTile = this.getTileFromCoord(king.coordinate);
        const neighbourTileNorthEast = currentTile.getNeighbourTileNorthEast();
        if (neighbourTileNorthEast !== undefined && neighbourTileNorthEast.hasPiece() && neighbourTileNorthEast.getPiece().type === 'pawn' && neighbourTileNorthEast.getPiece().colour !== king.colour)
            return true;
        const neighbourTileNorthWest = currentTile.getNeighbourTileNorthWest();
        if (neighbourTileNorthWest !== undefined && neighbourTileNorthWest.hasPiece() && neighbourTileNorthWest.getPiece().type === 'pawn' && neighbourTileNorthWest.getPiece().colour !== king.colour)
            return true;
        return false;
    }

    isCheckKnight = function (king) {
        let isCheck = false;
        const knight = new Knight(this, king.coordinate, king.colour === 'white' ? 'black' : 'white', this.scene);
        this.tempRemovePiece(king);
        this.addPiece(knight);
        const pseudolegalMoves = knight.getPseudolegalMoves();
        this.removePiece(knight);
        this.addPiece(king);
        pseudolegalMoves.forEach(move => {
            const piece = this.getPieceFromCoord(move);
            if (piece !== undefined && piece.type === 'knight' && piece.colour !== king.colour)
                isCheck = true;
        });
        return isCheck;
    }

    isCheckBishop = function (king) {
        let isCheck = false;
        const bishop = new Bishop(this, king.coordinate, king.colour === 'white' ? 'black' : 'white', this.scene);
        this.tempRemovePiece(king);
        this.addPiece(bishop);
        const pseudolegalMoves = bishop.getPseudolegalMoves();
        this.removePiece(bishop);
        this.addPiece(king);
        pseudolegalMoves.forEach(move => {
            const piece = this.getPieceFromCoord(move);
            if (piece === undefined)
                return;
            const raycastHit = new Raycaster(this).cast(piece.coordinate, king.coordinate);
            if (raycastHit !== undefined && raycastHit.coordinate !== piece.coordinate && raycastHit.coordinate !== king.coordinate)
                return;
            if (piece !== undefined && piece.type === 'bishop' && piece.colour !== king.colour)
                isCheck = true;
        });
        return isCheck;
    }

    isCheckRook = function (king) {
        let isCheck = false;
        const rook = new Rook(this, king.coordinate, king.colour === 'white' ? 'black' : 'white', this.scene);
        this.tempRemovePiece(king);
        this.addPiece(rook);
        const pseudolegalMoves = rook.getPseudolegalMoves();
        this.removePiece(rook);
        this.addPiece(king);
        pseudolegalMoves.forEach(move => {
            const piece = this.getPieceFromCoord(move);
            if (piece === undefined)
                return;
            if (new Raycaster(this).cast(piece.coordinate, king.coordinate))
                return;
            if (piece !== undefined && piece.type === 'rook' && piece.colour !== king.colour)
                isCheck = true;
        });
        return isCheck;
    }

    isCheckQueen = function (king) {
        let isCheck = false;
        const queen = new Queen(this, king.coordinate, king.colour === 'white' ? 'black' : 'white', this.scene);
        this.tempRemovePiece(king);
        this.addPiece(queen);
        const pseudolegalMoves = queen.getPseudolegalMoves();
        this.removePiece(queen);
        this.addPiece(king);
        pseudolegalMoves.forEach(move => {
            const piece = this.getPieceFromCoord(move);
            if (piece === undefined)
                return;
            if (new Raycaster(this).cast(piece.coordinate, king.coordinate))
                return;
            if (piece !== undefined && piece.type === 'queen' && piece.colour !== king.colour)
                isCheck = true;
        });
        return isCheck;
    }

    tileSelected = function (tile) {
        if (this.awaitingPromotion)
            return;
        if (localStorage.getItem('localGame') === 'true')
            this.handleTileSelectedLocal(tile);
        else
            this.handleTileSelectedOnline(tile);
    }

    handleTileSelectedLocal = function (tile) {
        // Selected tile is not valid, no piece: just set current tile to selected and clear valid tiles
        if (!this.validTiles.includes(tile.coordinate) && !tile.hasPiece()) {
            tile.setSelected();
            this.selectedTile = tile;
            this.clearValidTiles();
        }

        // Selected tile is not valid, has piece: set current tile to selected, set valid tiles to piece's valid moves
        if (!this.validTiles.includes(tile.coordinate) && tile.hasPiece()) {
            tile.setSelected();
            this.selectedTile = tile;
            let piece = tile.getPiece();
            this.clearValidTiles();
            if (piece.colour === this.colour) {
                this.validTiles = piece.getLegalMoves();
                this.validTiles.forEach(move => {
                    let t = this.getTileFromCoord(move);
                    t.setValid();
                });
            }
        }

        // Tile selected is valid: move piece from previously selected tile to newly selected tile.
        if (this.validTiles.includes(tile.coordinate)) {
            if (localStorage.getItem('localGame') == 'true')
                this.handlePieceMoveLocal(tile);
            else
                this.handlePieceMoveOnline(tile);
        }
    }

    handleTileSelectedOnline = function (tile) {
        const game = JSON.parse(localStorage.getItem('game'));

        if (game.playerTurn == localStorage.getItem('id')) {
            this.handleTileSelectedLocal(tile);
        } else {
            this.clearValidTiles();
            tile.setSelected();
            this.selectedTile = tile;
        }
    }

    handlePieceMoveLocal = function (tile) {
        this.halfMoveClock++;
        let prevTile = this.selectedTile;
        prevTile.setSelected(false);
        this.selectedTile = undefined;
        let piece = prevTile.getPiece();
        this.hasEnPassant = false;
        this.enPassant = undefined;

        // Check pawn double move:
        this.checkDoublePawnMove();

        // Check en passant:
        const [tookEnPassant, takenTile] = this.checkEnPassantLocal(piece, tile, prevTile);

        // Check promotion:
        const promoted = this.checkPromotionLocal(piece, tile);

        // Check half move clock reset:
        if (piece.type === 'pawn' || tile.hasPiece() || tookEnPassant)
            this.halfMoveClock = 0;

        this.logMove(prevTile, tile, tookEnPassant, takenTile);

        if (tile.hasPiece())
            this.removePiece(tile.getPiece());

        if (!promoted)
            this.togglePlayer();

        piece.moveTo(tile.coordinate);
        tile.setPiece(piece);
        this.clearValidTiles();
        this.buildTiles();
        this.buildCoordinates();
        this.handleStalemate();
        this.handleMate();
        this.handleRepetition();
        this.handle50Move();
        this.handleDeadPosition();
    }

    checkDoublePawnMoveLocal = function (piece, tile, prevTile) {
        if (piece.type === 'pawn') {
            if (tile.coordinate[0] === prevTile.coordinate[0]) {
                if (this.colour === 'white' && Number(tile.coordinate.slice(1, tile.coordinate.length) - Number(prevTile.coordinate.slice(1, prevTile.coordinate.length) === 2))) {
                    this.hasEnPassant = true;
                    this.enPassant = tile.coordinate;
                }
                else if (this.colour === 'black' && Number(tile.coordinate.slice(1, tile.coordinate.length) - Number(prevTile.coordinate.slice(1, prevTile.coordinate.length) === -2))) {
                    this.hasEnPassant = true;
                    this.enPassant = tile.coordinate;
                }
                else {
                    this.hasEnPassant = false;
                    this.enPassant = undefined;
                }
            }
        }
    }

    checkEnPassantLocal = function (piece, tile, prevTile) {
        if (piece.type === 'pawn') {
            switch (piece.colour) {
                case 'white':
                    if (tile.coordinate.charCodeAt(0) < prevTile.coordinate.charCodeAt(0) && !tile.hasPiece()) {
                        this.hasEnPassant = false;
                        this.enPassant = undefined;
                        const takenTile = prevTile.getNeighbourTileSouthWest();
                        const takenPiece = takenTile.getPiece();
                        if (takenPiece !== undefined && takenPiece.colour !== piece.colour) {
                            this.removePiece(takenPiece);
                        }
                        return [true, takenTile];
                    } 
                    else if (tile.coordinate.charCodeAt(0) > prevTile.coordinate.charCodeAt(0) && !tile.hasPiece()) {
                        this.hasEnPassant = false;
                        this.enPassant = undefined;
                        const takenTile = prevTile.getNeighbourTileSouthEast();
                        const takenPiece = takenTile.getPiece();
                        if (takenPiece !== undefined && takenPiece.colour !== piece.colour) {
                            this.removePiece(takenPiece);
                        }
                        return [true, takenTile];
                    }
                    break;
                case 'black':
                    if (tile.coordinate.charCodeAt(0) < prevTile.coordinate.charCodeAt(0) && !tile.hasPiece()) {
                        this.hasEnPassant = false;
                        this.enPassant = undefined;
                        const takenTile = prevTile.getNeighbourTileSouthEast();
                        const takenPiece = takenTile.getPiece();
                        if (takenPiece !== undefined && takenPiece.colour !== piece.colour) {
                            this.removePiece(takenPiece);
                        }
                        return [true, takenTile];
                    } 
                    else if (tile.coordinate.charCodeAt(0) > prevTile.coordinate.charCodeAt(0) && !tile.hasPiece()) {
                        this.hasEnPassant = false;
                        this.enPassant = undefined;
                        const takenTile = prevTile.getNeighbourTileSouthWest();
                        const takenPiece = takenTile.getPiece();
                        if (takenPiece !== undefined && takenPiece.colour !== piece.colour) {
                            this.removePiece(takenPiece);
                        }
                        return [true, takenTile];
                    }
                    break;
            }
        }
    }

    checkPromotionLocal = function (piece, tile) {
        if (piece.type === 'pawn') {
            let neighbourTileNorth = tile.getNeighbourTileNorth(piece.colour);
            if (neighbourTileNorth === undefined) {
                this.awaitingPromotion = true;
                this.scene.ui.createPromotionPrompt(piece);
                this.removePiece(piece);
                return true;
            }
        }
    }

    handlePieceMoveOnline = async function (tile) {
        const prevTile = this.selectedTile;
        const piece = prevTile.getPiece();
        const game = JSON.parse(localStorage.getItem('game'));
        const uat = localStorage.getItem('uat');

        if (!this.checkPromotionOnline(game, piece, tile, uat)) {
            const json = await this.sendMovementRequest(game, piece, tile, uat);
        
            // TODO: Should display an error here.
            if (json.success === false)
                return;
        }

        this.reloadOnline();
    }

    checkPromotionOnline = function (game, piece, tile, uat) {
        if (piece.type === 'pawn') {
            let neighbourTileNorth = tile.getNeighbourTileNorth(piece.colour);
            if (neighbourTileNorth === undefined) {
                this.awaitingPromotion = true;
                this.scene.ui.createPromotionPrompt(piece, async function (promotionPiece) {
                    const json = this.sendMovementRequest(game, piece, tile, uat, promotionPiece);
                    
                    // TODO: Should display an error here.
                    if (json.success === false)
                        return;
                });
                this.removePiece(piece);
                return true;
            }
            else
                return false;
        }
        else
            return false;
    }

    sendMovementRequest = async function (game, piece, tile, uat, promotionPiece = undefined) {
        const response = await fetch("https://localhost:5501/Movement/", {
            headers: {
                'Accepts': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                'gameID': game.id,
                'piece': {
                    'colour': piece.colour,
                    'coordinate': piece.coordinate,
                    'type': piece.type
                },
                'destination': tile.coordinate,
                'promotionPiece': promotionPiece,
                'userAccessToken': uat
            })
        });
        const json = await response.json();
        return json;
    }

    logMove = function (prevTile, tile, enPassant, enPassantTile) {
        const prevMoveCount = $('#moves').children().length + 1;
        const algebraicNotation = this.getAlgebraicNotation(prevTile, tile, enPassant, enPassantTile);
        switch (this.colour) {
            case 'white':
                $('#moves').append(`<div class='move' id='${prevMoveCount}'><div class='number'><p>${prevMoveCount}</p></div><div class='white'><p>${algebraicNotation}</p></div><div class='black'><p>-</p></div></div>`)
                break;
            case 'black':
                $('#moves').children().last().children('.black').children().last().text(algebraicNotation);
                break;
        }
    }

    getAlgebraicNotation = function (prevTile, tile, enPassant, enPassantTile) {
        let notation = '';
        const movingPiece = prevTile.getPiece();
        const attacking = tile.hasPiece() || enPassant;
        if (movingPiece.type !== 'pawn')
            notation += movingPiece.getFENChar().toUpperCase();

        if (attacking && movingPiece.type === 'pawn')
            notation += prevTile.coordinate.toLowerCase()[0] + 'x';
        else if (attacking && movingPiece.type !== 'pawn')
            notation += 'x';

        notation += tile.coordinate.toLowerCase();

        switch (movingPiece.colour) {
            case 'white':
                if (this.resultsInMateBlack(movingPiece, tile.coordinate))
                    notation += '#';
                else if (this.resultsInCheckBlack(movingPiece, tile.coordinate))
                    notation += '+';
                break;
            case 'black':
                if (this.resultsInMateWhite(movingPiece, tile.coordinate))
                    notation += '#';
                else if (this.resultsInCheckWhite(movingPiece, tile.coordinate))
                    notation += '+';
        }

        return notation;
    }

    handleMate = function () {
        if (this.isMateWhite()) {
            $('#game-end-container').css('visibility', 'visible');
            $('#game-end-container').children('p').first().text('Black Won!');
        }
        else if (this.isMateBlack()) {
            $('#game-end-container').css('visibility', 'visible');
            $('#game-end-container').children('p').first().text('White Won!');
        }
    }

    handleRepetition = function () {
        const currentFEN = this.toFEN().split(' ')[0];
        let count = 0;
        this.previousBoards.forEach(fen => {
            if (fen === currentFEN)
                count++;
        });

        if (count >= 3) {
            $('#game-end-container').css('visibility', 'visible');
            $('#game-end-container').children('p').first().text('Game Drawn!');
        }
    }

    handle50Move = function () {
        if (this.halfMoveClock >= 100) {
            $('#game-end-container').css('visibility', 'visible');
            $('#game-end-container').children('p').first().text('Game Drawn!');
        }
    }

    handleStalemate = function () {
        let legalMovesExist = false;
        this.pieces.forEach(piece => {
            if (piece.colour === this.colour) {
                const legalMoves = piece.getLegalMoves();

                if (legalMoves.length > 0)
                    legalMovesExist = true;
            }
        });

        if (!legalMovesExist && ((this.colour === 'white' && !this.isCheckWhite()) || (this.colour === 'black' && !this.isCheckBlack()))) {
            $('#game-end-container').css('visibility', 'visible');
            $('#game-end-container').children('p').first().text('Game Drawn!');
        }
    }

    handleDeadPosition = function () {
        if (this.pieces.length == 2) {
            if (this.pieces[0].type === 'king' && this.pieces[1].type === 'king') {
                $('#game-end-container').css('visibility', 'visible');
                $('#game-end-container').children('p').first().text('Game Drawn!');
            }
        }
    }

    togglePlayer = function () {
        this.colour = this.colour === 'white' ? 'black' : 'white';
    }

    toFEN = function () {
        let FEN = '';
        for (let i = 11; i >= 1; i--) {
            let row = this.getRow(i);
            row.sort((tile1, tile2) => {
                let letter1 = tile1.coordinate.match('^[A-K]')[0];
                let letter2 = tile2.coordinate.match('^[A-K]')[0];
                return letter1.localeCompare(letter2);
            });
            let xCount = 11 - row.length;
            FEN += 'x'.repeat(xCount/2);

            let emptyTileCount = 0;

            row.forEach((tile) => {
                let piece = this.getPieceFromCoord(tile.coordinate);
                if (piece == null) {
                    emptyTileCount++;
                    return;
                }

                if (emptyTileCount > 0) {
                    FEN += emptyTileCount;
                    emptyTileCount = 0;
                }

                FEN += piece.getFENChar();
            });

            if (emptyTileCount > 0) {
                FEN += emptyTileCount;
                emptyTileCount = 0;
            }

            FEN += 'x'.repeat(xCount/2);
            FEN += '/';
        }

        FEN = FEN.substring(0, FEN.length-1);
        FEN += ' ' + this.colour[0];

        if (this.hasEnPassant)
            FEN += ' ' + this.enPassant.toLowerCase();
        else
            FEN += ' -';

        FEN += ' ' + this.halfMoveClock;
        FEN += ' ' + this.fullMoveClock;

        return FEN;
    }

    getRow = function (rowNumber) {
        let row = [];
        this.tiles.forEach((tile) => {
            if (new RegExp('^[A-K]' + rowNumber + '$').test(tile.coordinate))
                row.push(tile);
        });
        return row;
    }

    init = function () {
        let fen = this.scene.cache.text.get('fen_initial_layout');
        let loader = new FENLoader(fen, this, this.scene);
        loader.load();
    }

    loadFEN = function (fen, perspective) {
        let loader = new FENLoader(fen, this, this.scene);
        loader.load(perspective);
    }

    loadLocal = function () {

    }

    loadOnline = function () {
        $('#tray #moves').empty();
        if (localStorage.getItem('localGame') === 'true')
            localStorage.setItem('localGame', 'false');
        const playerID = localStorage.getItem('id');
        const game = JSON.parse(localStorage.getItem('game'));
        const perspective = game.whitePlayer.id == playerID ? 'w' : 'b';
        this.loadFEN(game.fen, perspective);
        this.buildTiles();
        this.buildCoordinates();
        this.populateNotationTray(game.pgn);
    }

    reloadOnline = async function () {
        const gameID = JSON.parse(localStorage.getItem('game')).id;
        const response = await fetch('https://localhost:5501/FetchGame/', {
            headers: {
                'Accepts': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({'gameID': gameID})
        });
        const json = await response.json();
        const game = json.game;
        localStorage.setItem('game', JSON.stringify(game));
        this.loadOnline();
    }

    populateNotationTray = function (pgn) {
        $('#tray #moves').empty();
        const turns = pgn.match(/[1-9][0-9]*\. [a-zA-Z0-9 ]+/g);
        if (turns == null)
            return;
        turns.forEach(turn => {
            const splitTurn = turn.trim().split(' ');
            if (splitTurn.length === 2)
                $('#tray #moves').append(`<div class='move' id='${splitTurn[0]}'><div class='number'><p>${splitTurn[0]}</p></div><div class='white'><p>${splitTurn[1]}</p></div><div class='black'><p>-</p></div></div>`);
            else if (splitTurn.length === 3)
                $('#tray #moves').append(`<div class='move' id='${splitTurn[0]}'><div class='number'><p>${splitTurn[0]}</p></div><div class='white'><p>${splitTurn[1]}</p></div><div class='black'><p>${splitTurn[2]}</p></div></div>`);
        });
    }
}