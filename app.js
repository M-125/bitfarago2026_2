function gameLogic(field) {}

function initField(size) {
    // This function initializes the playing area [field] by generating its arrays and filling the tiles with fruits
    // Field is the playing area defined by the user. 0-0 Is the upper left corner.
    // The field variable is made up of arrays, it has x amount of arrays [rows] and in those arrays there are x amount of intigers [the specific tile of the row] in those arrays
    // These intigers represent the tiles' state
    // 0 means its empty
    // 1 means it contains an apple
    // 2 means it contains a grape
    // 3 means it contains a pear
    // 4 means it contains the player's body
    // 5 means it contains the players head, which should have a non-directional sprite
    const gyumi_fraction = 5; // How common is it for a fruit to get placed [1 / gyumi_fraction]
    let field = []; // Make the field variable
    for (let i = 0; i < size; i++) {
        // Iterate over the provided size
        field[i] = []; // Make an empty array for a new row
        for (let u = 0; u < size; u++) {
            // Iterate over the size again to fill the rows with values
            if (
                // Used to fill the tiles with fruit 1 / gyumi_fraction of the time
                Math.floor(Math.random() * gyumi_fraction) ===
                gyumi_fraction - 1
            ) {
                // If true it generates a random number between 1 and 3 to represent the fruits
                field[i][u] = Math.floor(Math.random() * 3) + 1;
            } else {
                // If false it fills it with a 0 to represent an empty space
                field[i][u] = 0;
            }
        }
    }
    return field;
}

function initGame() {
    // Initializes the game; makes a popup window for size selection, displays that field, prompts user to select starting position then hands 'field' off to gameLogic()
    // Someone pls make a popup for size selection :3
    size = 10;
    let field = initField(size); // Initialize field with given size
    drawField(field); // Draw the field
    // tile-${i}-${u} is there to help with putting the player on the desired square
}

function drawField(field) {
    // This function will render the field
    console.log(field);
    let to_draw = ""; // We will pass this as innerHTML to the div with id 'playArea'
    const field_size = field.length; // Get the size of the field
    const row_classes = "h-13 flex"; // Used for classing the row divs
    const tile_classes = "m-1 aspect-square w-13 bg-orange-200 text-center"; // Used for classing the tile divs
    const button_classes = ""; // Used for classing tile buttons
    for (
        let i = 0;
        i < field_size;
        i++ // Iterate over the field
    ) {
        to_draw += `<div class="${row_classes}">`; // Append starting div of row with classes
        for (
            let u = 0;
            u < field_size;
            u++ // Iterate again to get the values of tiles
        ) {
            to_draw += [
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="console.log('Cannot be placed!')">nincs</button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="placePlayer(${i}, ${u}, ${field})">alma</button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="placePlayer(${i}, ${u}, ${field})">szolo</button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="placePlayer(${i}, ${u}, ${field})">korte</button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="console.log('Cannot be placed!')">test(?)</button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="console.log('Cannot be placed!')">fej</button></div>`,
            ][field[i][u]]; // Get whatever is supposed to get drawn from the array
        }

        to_draw += "</div>"; // Append ending div of row
    }

    document.getElementById("playArea").innerHTML = to_draw; // Render the elements
}

function placePlayer(row, column, field) {
    console.log(row, column, field);
    field[row][column].splice(0, 1, 5);
    drawField(field);
}

initGame();
