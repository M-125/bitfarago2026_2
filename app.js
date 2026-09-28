function gameLogic(field) {}

const MAX_SIDE_SIZE = 16;
const MIN_SIDE_SIZE = 10;
let field = []; // Make the field global variable
let last_tile_player_was_on = [];

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

function HexToHSL(hex) {
    // Grabbed from: https://www.jameslmilner.com/posts/converting-rgb-hex-hsl-colors/#hex-to-hsl
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const rHex = parseInt(result[1], 16);
    const gHex = parseInt(result[2], 16);
    const bHex = parseInt(result[3], 16);

    const r = rHex / 255;
    const g = gHex / 255;
    const b = bHex / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = (max + min) / 2;
    let s = h;
    let l = h;

    if (max === min) {
        // Achromatic
        return { h: 0, s: 0, l };
    }

    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
        case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / d + 2;
            break;
        case b:
            h = (r - g) / d + 4;
            break;
    }
    h /= 6;

    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);
    h = Math.round(360 * h);

    return [h, s, l];
}

document
    .getElementById("character_color")
    .addEventListener("change", watchColorPicker);

function watchColorPicker(event) {
    // Base colors in hsl
    // Primary = 133, 51, 50
    // Secondary = 133, 55, 37   relative to primary = 1, 1.078, 0.74
    // Tetriary = 133, 63, 62   relative to primary = 1, 1.235, 1.24
    // Quaternary = 133, 59, 26   relative to primary = 1, 1.157, 0.52
    base_color_hsl = HexToHSL(event.target.value);
    dino_primary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1]}%, ${base_color_hsl[2]}%)`;
    dino_secondary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1] * 1.078}%, ${base_color_hsl[2] * 0.74}%)`;
    dino_tetriary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1] * 1.235}%, ${base_color_hsl[2] * 1.24}%)`;
    dino_quaternary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1] * 1.157}%, ${base_color_hsl[2] * 0.52}%)`;
    console.log(dino_primary, dino_secondary, dino_tetriary);

    document.getElementById("dino_primary_color").style.fill = dino_primary;
    document.getElementById("dino_secondary_color").style.fill = dino_secondary;
    document.getElementById("dino_tetriary_color").style.fill = dino_tetriary;
    document.getElementById("dino_quaternary_color").style.fill =
        dino_quaternary;
}

document.getElementById("initForm").addEventListener("submit", initGame);

function initGame(event) {
    // Initializes the game; makes a popup window for size selection, displays that field, prompts user to select starting position then draws that field using drawField
    event.preventDefault();
    const formData = new FormData(event.target);

    const size = formData.get("field_size_input"); // Get set size for initialization
    const color = formData.get("character_color"); // Get set color for correct display of player

    let field = initField(size); // Initialize field with given size

    drawField(field, color); // Draw the field
    // tile-${i}-${u} is there to help with putting the player on the desired square
}

function drawField(field, color) {
    // This function will render the field
    let to_draw = ""; // We will pass this as innerHTML to the div with id 'playArea'
    const field_size = field.length; // Get the size of the field
    const row_classes = "h-13 flex"; // Used for classing the row divs
    const tile_classes =
        "ring-2 aspect-square h-13 w-13 bg-orange-200 text-center"; // Used for classing the tile divs
    const button_classes = ""; // Used for classing tile buttons
    const main_color = color;
    const secondary_color = color;
    const tetriary_color = color;
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
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="console.log('Cannot be placed!')"></button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="placePlayer(${i}, ${u})"><img src="./assets/apple.svg" class="w-10 p-1" /></button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="placePlayer(${i}, ${u})"><img src="./assets/grape.svg" class="w-10 p-1" /></button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="placePlayer(${i}, ${u})"><img src="./assets/pear.svg" class="w-10 p-1" /></button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="console.log('Cannot be placed!')">test(?)</button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="console.log('Cannot be placed!')"><svg xmlns="http://www.w3.org/2000/svg" class="w-13 h-13" viewBox="0 0 27 27"> <path d="M12 0v1h6V0h-6m6 1v1h2V1h-2m2 0h3V0h-3zm3 0v1h1V1zm1 1v2h1V2zm0 2h-1v1h1zm0 1v1h1V5zm1 1v1h1V6zm0 1h-1v2h1V7m-1 2h-1v1h1zm0 1v1h1v-1zm1 1v1h1v-1zm0 1h-1v2h1v-2m-1 2h-1v1h1zm0 1v1h1v-1zm1 1v1h1v-1zm0 1h-1v2h1v-2m-1 2h-1v1h1zm-1 1h-1v1h1zm0 1v1h1v-1zm1 1v1h1v-1zm1 1v1h1v-1zm0 1h-5v1h5zm-5 0v-1h-1v1zm-1 0h-1v2h1v-2m-1 2h-2v-2h-1v3h3zM12 1h-2v1h2zm-2 1H9v1h1zM9 3H8v2h1V3M8 5H4v1h4zM4 6H3v1h1zM3 7H2v1h1zM2 8H1v6h1V8m0 6v1h1v-1zm1 1v1h4v-1H3m4 1v6h1v-6zm1 6v2h1v-2zm1 2v1h1v-1zm1 1v2h3v-1h-2v-1zm3 1h1v-2h-1v2M12 3v3h2V5h-1V3z" style="fill: #000; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M20 2v1h1V2zm1 1v2h1V3zm1 2v15h1V5zM8 5v1h1V5zm0 5v1h1v-1zm0 1H2v1h6zm5 4v3h1v-3zm1 3v1h3v-1h-3m3 0h1v-3h-1v3m-8 5v1h6v-1H9" style="fill: #1b682c; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M12 1v1h6V1h-6m6 1v1h2V2h-2m-6 0h-2v1h2zm-2 1H9v1h1zM4 6v1h2V6H4m0 1H3v1h1zM3 8H2v1h1z" style="fill: #61db7b; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M12 2v1h2v3h-2V3h-2v1H9v2H6v1H4v1H3v1H2v2h6v-1h1v1H8v1H2v1h6v1h1v1h1v1h1v1h1v1h1v-3h1v3h3v-3h1v4h-1v1h-3v-1h-1v4h2v1h1v2h2v-2h1v-2h1v1h3v-1h-1V5h-1V3h-3V2h-6m-1 5h1v1h1V7h1v1h-1v1h-1V8h-1v1h-1V8h1z" style="fill: #3ec15b; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M13 3v2h1V3z" style="fill: #fff; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M11 7v1h1V7zm1 1v1h1V8zm1 0h1V7h-1zm-2 0h-1v1h1z" style="fill: #b20000; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M2 13v1h1v1h4v1h3v-1H9v-1H8v-1H2m11 5v1h1v-1zm1 1v1h3v-1h-3m3 0h1v-1h-1zm2 3v1h1v-1zm1 1v1h4v-1h-4m-10 1v1h1v1h2v-2h-3" style="fill: #2b9342; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M8 16v1h3v-1H8m3 1v1h1v-1zm1 1v5h1v-5z" style="fill: #ebb328; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M8 17v5h1v-5zm1 5v1h1v-1z" style="fill: #edc36f; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M9 17v5h1v1h2v-5h-1v-1H9" style="fill: #ffda89; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M20 1v1h3V1h-3m3 1v1h1V2zm0 3v1h1V5zm1 1v1h1V6zm-1 4v1h1v-1zm1 1v1h1v-1zm-1 4v1h1v-1zm1 1v1h1v-1z" style="fill: #ffed87; stroke-width: 0.264583; fill-opacity: 1" /> <path d="M21 2v1h1v2h1V4h1V3h-1V2h-2m2 4v3h1V6zm0 5v3h1v-3zm0 5v3h1v-3zm-1 5v1h1v-1zm1 1v1h1v-1zm1 1v1h1v-1z" style="fill: #f4da23; stroke-width: 0.264583; fill-opacity: 1" /> </svg></button></div>`,
            ][field[i][u]]; // Get whatever is supposed to get drawn from the array
        }

        to_draw += "</div>"; // Append ending div of row
    }

    document.getElementById("playArea").innerHTML = to_draw; // Render the elements
}

function placePlayer(row, column) {
    if (last_tile_player_was_on.length > 0) {
        field[last_tile_player_was_on[0]].splice(
            last_tile_player_was_on[1],
            1,
            0,
        ); // Make the last tile that the player was on empty
    }
    last_tile_player_was_on = [row, column];
    field[row].splice(column, 1, 5); // Replace given tile with player head
    drawField(field); // Draw the new field with the player head
}

function validateStart() {
    const field_side = document.getElementById("field_size").value;
    const error_div = document.getElementById("error_field");

    if (field_side >= MIN_SIDE_SIZE && field_side <= MAX_SIDE_SIZE) {
        error_div.innerHTML = ``;
    } else {
        error_div.innerHTML = `<p class="text-xl text-center text-red-600 font-bold lili mb-5">A pályaméret nem szabályos!</p>`;
    }
}

function validateStart() {
    if (
        5 <
        document.getElementById("field_size_input").getAttribute("value") <
        17
    ) {
        document.getElementById("selection_popup").classList.toggle("hidden");
    }
}
