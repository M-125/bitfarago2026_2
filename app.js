function gameLogic(field) {}

// GLOBALS START

let field = []; // Make the field global variable
let last_tile_player_was_on = []; // Last tile player was placed on, updates on every placePlayer call
const fruit_energy = { apple: 4, grape: 5, pear: 6 }; // The energy each fruit gives when eaten
let energy = 0; // Initialize player energy
let collected = { apple: 0, grape: 0, pear: 0 }; // Collected fruits
let dino_color = "#3ec15b"; // Primary color of player, defined in initialization popup
let on_field_fruits_count = 0;
let energy_multiplier = 1;
let gyumi_fraction = 15; // How common is it for a fruit to get placed [1 / gyumi_fraction]
let numberOfRestarts = 0; // How many times has the player restarted
let is_game_stopped_manually = false; // Whether the game was stopped manually with the stop button
let is_talking = false;

// GLOBALS END

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
    field = [];
    for (let i = 0; i < size; i++) {
        // Iterate over the provided size
        field[i] = []; // Make an empty array for a new row
        for (let u = 0; u < size; u++) {
            // Fill whole map with 0s
            field[i][u] = 0;
        }
    }
    for (let i = 0; i < Math.floor((size * size) / gyumi_fraction); i++) {
        //generate fruits
        //if placed on a tile that already has a fruit then try again
        let tile = [
            Math.floor(Math.random() * size),
            Math.floor(Math.random() * size),
        ];
        while (field[tile[0]][tile[1]] != 0) {
            tile = [
                Math.floor(Math.random() * size),
                Math.floor(Math.random() * size),
            ];
        }

        field[tile[0]][tile[1]] = Math.floor(Math.random() * 3) + 1;
        on_field_fruits_count += 1;
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

    const output = [h, s, l];

    return output;
}

document
    .getElementById("character_color")
    .addEventListener("change", watchColorPicker); // If color is changed in popup, change preview dino too

function watchColorPicker(event) {
    // Base colors in hsl
    // Primary = 133, 51, 50
    // Secondary = 133, 55, 37   relative to primary = 1, 1.078, 0.74
    // Tetriary = 133, 63, 62   relative to primary = 1, 1.235, 1.24
    // Quaternary = 133, 59, 26   relative to primary = 1, 1.157, 0.52
    dino_color = event.target.value;
    const base_color_hsl = HexToHSL(dino_color); // Get selected value from picker in hex, convert it to hsl with HexToHSL function, this will be the new primary color. Stored as a list eg. [133, 55, 47]
    const dino_primary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1]}%, ${base_color_hsl[2]}%)`; // The biggest part
    const dino_secondary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1] * 1.078}%, ${base_color_hsl[2] * 0.74}%)`; // Get new secondary color based on default color relations
    const dino_tetriary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1] * 1.235}%, ${base_color_hsl[2] * 1.24}%)`; // Get new tetriary color based on default color relations
    const dino_quaternary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1] * 1.157}%, ${base_color_hsl[2] * 0.52}%)`; // Get new quaternary color based on default color relations
    // Set correct values in displayed svg

    let dino_primary_color = document.querySelectorAll(
        "[id='dino_primary_color']",
    );

    let dino_secondary_color = document.querySelectorAll(
        "[id='dino_secondary_color']",
    );

    let dino_tetriary_color = document.querySelectorAll(
        "[id='dino_tetriary_color']",
    );

    let dino_quaternary_color = document.querySelectorAll(
        "[id='dino_quaternary_color']",
    );

    for (let i = 0; i < dino_primary_color.length; i++) {
        dino_primary_color[i].style.fill = dino_primary;
        dino_primary_color[i].style.stroke = dino_primary;
    }

    for (let i = 0; i < dino_secondary_color.length; i++) {
        dino_secondary_color[i].style.fill = dino_secondary;
        dino_secondary_color[i].style.stroke = dino_secondary;
    }

    for (let i = 0; i < dino_tetriary_color.length; i++) {
        dino_tetriary_color[i].style.fill = dino_tetriary;
        dino_tetriary_color[i].style.stroke = dino_tetriary;
    }

    for (let i = 0; i < dino_quaternary_color.length; i++) {
        dino_quaternary_color[i].style.fill = dino_quaternary;
        dino_quaternary_color[i].style.stroke = dino_quaternary;
    }
}

// When start is pressed, initialize the game
document.getElementById("initForm").addEventListener("submit", initGame);

function initGame(event) {
    // Initializes the game; makes a popup window for size selection, displays that field, prompts user to select starting position then draws that field using drawField
    event.preventDefault();
    const formData = new FormData(event.target);
    document.getElementById("playArea").classList.add("ring-4");
    popup();

    const size = formData.get("field_size_input"); // Get set size for initialization
    const color = formData.get("character_color"); // Get set color for correct display of player
    energy = Math.ceil(((size * size) / 10) * energy_multiplier); // Set energy based on field size
    collected = { apple: 0, grape: 0, pear: 0 }; // Reset collected fruits
    last_tile_player_was_on = [];
    let field = initField(size); // Initialize field with given size
    drawField(field, color); // Draw the field
    update_counters();
    dinoWelcomeSpeech();
    // tile-${i}-${u} is there to help with putting the player on the desired square
}

function drawField(field) {
    // This function will render the field
    let to_draw = ""; // We will pass this as innerHTML to the div with id 'playArea'
    const field_size = field.length; // Get the size of the field
    const row_classes = "h-13 flex"; // Used for classing the row divs
    const tile_classes =
        "ring-2 aspect-square h-13 w-13 bg-orange-200 text-center"; // Used for classing the tile divs
    const button_classes = ""; // Used for classing tile buttons
    // Code reused from watchColorPicker
    // Base colors in hsl
    // Primary = 133, 51, 50
    // Secondary = 133, 55, 37   relative to primary = 1, 1.078, 0.74
    // Tetriary = 133, 63, 62   relative to primary = 1, 1.235, 1.24
    // Quaternary = 133, 59, 26   relative to primary = 1, 1.157, 0.52
    const base_color_hsl = HexToHSL(dino_color); // Get selected value from picker in hex, convert it to hsl with HexToHSL function, this will be the new primary color. Stored as a list eg. [133, 55, 47]
    const dino_primary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1]}%, ${base_color_hsl[2]}%)`; // The biggest part
    const dino_secondary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1] * 1.078}%, ${base_color_hsl[2] * 0.74}%)`; // Get new secondary color based on default color relations
    const dino_tetriary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1] * 1.235}%, ${base_color_hsl[2] * 1.24}%)`; // Get new tetriary color based on default color relations
    const dino_quaternary = `hsl(${base_color_hsl[0]}, ${base_color_hsl[1] * 1.157}%, ${base_color_hsl[2] * 0.52}%)`; // Get new quaternary color based on default color relations
    // Set correct values in displayed svg;
    let isDinoSpeechBubbleHidden = "";
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
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="w-13 h-13 ${button_classes}" onclick="typewriterAnimation('Hé! Ez nem egy gyümi, ide nem tudok menni!')">⠀</button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="(placePlayer(${i}, ${u}, 'apple'), isGameOver())"><img src="./assets/apple.svg" class="w-10 p-1" /></button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="(placePlayer(${i}, ${u}, 'grape'), isGameOver())"><img src="./assets/grape.svg" class="w-10 p-1" /></button></div>`,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="(placePlayer(${i}, ${u}, 'pear'), isGameOver())"><img src="./assets/pear.svg" class="w-10 p-1" /></button></div>`,
                ``,
                `<div id="tile-${i}-${u}" class="${tile_classes}"><button class="${button_classes}" onclick="typewriterAnimation('Ne is álmodj róla, nem eszem meg magam')"><svg xmlns="http://www.w3.org/2000/svg" class="w-13 h-13 z-10" viewBox="0 0 27 27" > <path d="M12 0v1h6V0h-6m6 1v1h2V1h-2m2 0h3V0h-3zm3 0v1h1V1zm1 1v2h1V2zm0 2h-1v1h1zm0 1v1h1V5zm1 1v1h1V6zm0 1h-1v2h1V7m-1 2h-1v1h1zm0 1v1h1v-1zm1 1v1h1v-1zm0 1h-1v2h1v-2m-1 2h-1v1h1zm0 1v1h1v-1zm1 1v1h1v-1zm0 1h-1v2h1v-2m-1 2h-1v1h1zm-1 1h-1v1h1zm0 1v1h1v-1zm1 1v1h1v-1zm1 1v1h1v-1zm0 1h-5v1h5zm-5 0v-1h-1v1zm-1 0h-1v2h1v-2m-1 2h-2v-2h-1v3h3zM12 1h-2v1h2zm-2 1H9v1h1zM9 3H8v2h1V3M8 5H4v1h4zM4 6H3v1h1zM3 7H2v1h1zM2 8H1v6h1V8m0 6v1h1v-1zm1 1v1h4v-1H3m4 1v6h1v-6zm1 6v2h1v-2zm1 2v1h1v-1zm1 1v2h3v-1h-2v-1zm3 1h1v-2h-1v2M12 3v3h2V5h-1V3z" style=" fill: #000; stroke: #000; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M20 2v1h1V2zm1 1v2h1V3zm1 2v15h1V5zM8 5v1h1V5zm0 5v1h1v-1zm0 1H2v1h6zm5 4v3h1v-3zm1 3v1h3v-1h-3m3 0h1v-3h-1v3m-8 5v1h6v-1H9" style=" fill: ${dino_quaternary}; stroke: ${dino_quaternary}; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M12 1v1h6V1h-6m6 1v1h2V2h-2m-6 0h-2v1h2zm-2 1H9v1h1zM4 6v1h2V6H4m0 1H3v1h1zM3 8H2v1h1z" style=" fill: ${dino_tetriary}; stroke: ${dino_tetriary}; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M12 2v1h2v3h-2V3h-2v1H9v2H6v1H4v1H3v1H2v2h6v-1h1v1H8v1H2v1h6v1h1v1h1v1h1v1h1v1h1v-3h1v3h3v-3h1v4h-1v1h-3v-1h-1v4h2v1h1v2h2v-2h1v-2h1v1h3v-1h-1V5h-1V3h-3V2h-6m-1 5h1v1h1V7h1v1h-1v1h-1V8h-1v1h-1V8h1z" style=" fill: ${dino_primary}; stroke: ${dino_primary}; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M13 3v2h1V3z" style=" fill: #fff; stroke: #fff; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M11 7v1h1V7zm1 1v1h1V8zm1 0h1V7h-1zm-2 0h-1v1h1z" style=" fill: #b20000; stroke: #b20000; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M2 13v1h1v1h4v1h3v-1H9v-1H8v-1H2m11 5v1h1v-1zm1 1v1h3v-1h-3m3 0h1v-1h-1zm2 3v1h1v-1zm1 1v1h4v-1h-4m-10 1v1h1v1h2v-2h-3" style=" fill: ${dino_secondary}; stroke: ${dino_secondary}; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M8 16v1h3v-1H8m3 1v1h1v-1zm1 1v5h1v-5z" style=" fill: #ebb328; stroke: #ebb328; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M8 17v5h1v-5zm1 5v1h1v-1z" style=" fill: #edc36f; stroke: #edc36f; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M9 17v5h1v1h2v-5h-1v-1H9" style=" fill: #ffda89; stroke: #ffda89; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M20 1v1h3V1h-3m3 1v1h1V2zm0 3v1h1V5zm1 1v1h1V6zm-1 4v1h1v-1zm1 1v1h1v-1zm-1 4v1h1v-1zm1 1v1h1v-1z" style=" fill: #ffed87; stroke: #ffed87; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /> <path d="M21 2v1h1v2h1V4h1V3h-1V2h-2m2 4v3h1V6zm0 5v3h1v-3zm0 5v3h1v-3zm-1 5v1h1v-1zm1 1v1h1v-1zm1 1v1h1v-1z" style=" fill: #f4da23; stroke: #f4da23; fill-opacity: 1; stroke-width: 0.1; stroke-opacity: 1; stroke-dasharray: none; stroke-linejoin: miter; paint-order: stroke fill markers; " /></svg></button></div>`,
            ][field[i][u]]; // Get whatever is supposed to get drawn from the array
        }

        to_draw += "</div>"; // Append ending div of row
        document.getElementById("playArea").innerHTML = to_draw; // Render the elements
    }
}

function placePlayer(row, column, fruit) {
    if (
        last_tile_player_was_on.length > 0
    ) // If the player has been placed already
    {
        if (
            energy -
                (Math.abs(row - last_tile_player_was_on[0]) +
                    Math.abs(column - last_tile_player_was_on[1])) >=
            0
        ) // If going to the desired tile doesnt result in negative energy
        {
            energy -=
                Math.abs(row - last_tile_player_was_on[0]) +
                Math.abs(column - last_tile_player_was_on[1]); // Subtract energy needed to travel to desired place
            field[last_tile_player_was_on[0]].splice(
                last_tile_player_was_on[1],
                1,
                0,
            ); // Relpace old tile with an empty one
            collected[fruit] += 1; // Add whichever fruit was collected to the total
            update_counters(); // Display new values
            last_tile_player_was_on = [row, column]; // Relpace old value with the current one
            field[row].splice(column, 1, 5); // Replace given tile with player head
            drawField(field); // Draw the new field with the player head
            on_field_fruits_count -= 1;
            if (on_field_fruits_count == 0) {
                is_game_stopped_manually = false;
            }
        }

        isGameOver(); // Check if game is over !!! COULD BE REMOVED, TAKE REMOVAL INTO CONSIDERATION IN TESTING

        // Make the last tile that the player was on empty
    } else // If this is the first time the player is placed
    {
        on_field_fruits_count -= 1;
        collected[fruit] += 1; // Add whichever fruit was collected to the total
        update_counters();
        last_tile_player_was_on = [row, column]; // Relpace old value with the current one
        field[row].splice(column, 1, 5); // Replace given tile with player head
        drawField(field); // Draw the new field with the player head
    }
    isGameOver(); // Check if game is over !!! COULD BE REMOVED, TAKE REMOVAL INTO CONSIDERATION IN TESTING
}

async function isGameOver() {
    if (!isAnyFruitNearby()) {
        if (on_field_fruits_count === 0) {
            // If there are no fruits to be eaten (and isAnyFruitNearby returns false)

            await typewriterAnimation("Hurrá!!!");
            confetti();
            await new Promise((r) => setTimeout(r, 1500)).then(() => {
                gameOver();
            });
            // Replace this with gameover logic
        } else {
            gameOver();
        }
    }
    return false; // !!! COULD BE REMOVED, TAKE REMOVAL INTO CONSIDERATION IN TESTING
}

function fruitEnergy() {
    let sum = 0;
    for (fruit in collected) {
        sum += collected[fruit] * fruit_energy[fruit];
    }
    return sum;
}

function isAnyFruitNearby() {
    let fruit_array = []; // Will be filled with coordinates of fruit containing tiles
    for (let [rowindex, row] of field.entries()) {
        // Iterate over the field while capturing each index for later usage
        for (let [columnindex, column] of row.entries()) {
            // Iterate over the rows while capturing each index for later usage
            if (
                4 > column &&
                column > 0
            ) // If the current tile is neither empty or contains the player
            {
                fruit_array.push([rowindex, columnindex]); // Put that tile into fruit_array
            }
        }
    }

    for (let [_, fruits] of fruit_array.entries()) {
        // Iterate over the fruit_array to check if any fruit is reachable

        if (
            energy +
                fruitEnergy() -
                (Math.abs(fruits[0] - last_tile_player_was_on[0]) +
                    Math.abs(fruits[1] - last_tile_player_was_on[1])) >=
            0
        ) // If using the placePlayer logic for movement it returns a non-zero value
        {
            return true; // Return true to signal there IS a reachable fruit
        }
    }
    return false; // Return false to signal there ISN'T a reachable fruit
}

function update_counters() {
    document.getElementById("energy").innerHTML = energy; // Update energy p tag with current energy
    for (fruit in collected) {
        // Iterate over the collected fruits
        document.getElementById(fruit).innerHTML = collected[fruit]; // Update values of collected fruits in each of their respective images
    }
}

function eatFruit(fruit) {
    appleSpeech = [
        "Annyira finom ez az alma!",
        "Kaphatnék még egyet légyszi?",
        "Minden nap egy alma, a dínót távol tartja!",
        "Imádom a piros dolgokat!",
        "Irány az ALMAmáter!",
    ];
    grapeSpeech = [
        "Annyira fincsa ez a szőlő!",
        "Imádom a bogyókat!",
        "Az a kedvencem amikor hideg és ropogós!",
        "Igazi muskotálya van ennek!",
    ];
    pearSpeech = [
        "Annyira finom ez a körte!",
        "Nagyon kedvelem a körtéknek a sajátos ízét!",
        "A nagyapám vilmos körtéjéhez ez közel sincs!",
        "Ebből lehett volona pálinka, nincs semmi ok a pánikra!",
        "Ez nem egy négyzet, ez egy KÖRte!",
    ];
    if (collected[fruit] > 0) // If there is one or more fruit to be eaten
    {
        if (
            Math.floor(Math.random() * 5) >= 1
        ) // 4/5 chance that there is speech after an eaten fruit
        {
            if (
                Math.floor(Math.random() * 100) === 67
            ) // 1 in 100 chance to be rotten
            {
                typewriterAnimation(`FÚJ!!! Ez rohadt volt!!`);
            } else if (fruit === "apple") {
                typewriterAnimation(
                    appleSpeech[Math.floor(Math.random() * appleSpeech.length)],
                );
            } else if (fruit === "grape") {
                typewriterAnimation(
                    grapeSpeech[Math.floor(Math.random() * grapeSpeech.length)],
                );
            } else if (fruit === "pear") {
                typewriterAnimation(
                    pearSpeech[Math.floor(Math.random() * pearSpeech.length)],
                );
            }
        }
        collected[fruit] -= 1; // Subtract one off that fruit
        energy += fruit_energy[fruit]; // Give energy corresponding to that fruit
        update_counters(); // Update the displayed counters
        const butt = document.getElementById(fruit).parentElement; // a BUTT
        if (butt.classList.contains("animation"))
            butt.classList.remove("animation"); // Remove animation so it can be played again (i bet theres a better way but me acting dumb)
        setTimeout(() => butt.classList.add("animation"), 30); // Play animation
    }
}

function gameOver() {
    document.getElementById("playArea").innerHTML = "";
    display_scores();
    document.getElementById("playArea").classList.remove("ring-4");
    init_score_div();
    numberOfRestarts += 1;
    localStorage.setItem("numberOfRestarts", numberOfRestarts.toString());
    hide_ui();
    if (on_field_fruits_count != 0) {
        is_game_stopped_manually = true;
    } else {
        is_game_stopped_manually = false;
    }
}

function select_popup() {
    confetti();
    on_field_fruits_count = 0;
    document.getElementById("selection_popup").classList.remove("hidden");
    document.getElementById("game_over").classList.add("hidden");
}

function popup() {
    let popup = document.getElementById("selection_popup");
    const blurred = document.getElementById("beBlurred");
    if (!popup.classList.contains("hidden")) {
        document.getElementById("selection_popup").classList.toggle("hidden");
        popup = document.getElementById("selection_popup");
    }
    if (popup.classList.contains("hidden")) {
        blurred.classList.remove("hidden");
        blurred.classList.remove("blur-sm");
    }
}

function hide_ui() {
    const blurred = document.getElementById("beBlurred");
    blurred.classList.add("hidden");
}

function init_score_div() {
    const score_div = document.getElementById("score_div");
    score_div.classList.add("h-12");
    score_div.classList.remove("h-45");

    // button.classList.remove("rotate-90");
}

function toggle_total_score(button) {
    const score_div = document.getElementById("score_div");

    if (score_div.classList.contains("h-12")) {
        score_div.classList.remove("h-12");
        score_div.classList.add("h-45");

        button.classList.add("rotate-90");
    } else {
        score_div.classList.add("h-12");
        score_div.classList.remove("h-45");

        button.classList.remove("rotate-90");
    }
}

// calculates and displays the total and the sub-scores with the game-over panel
function display_scores() {
    const score_div = document.getElementById("score_div");
    const game_over_div = document.getElementById("game_over");
    game_over_div.classList.remove("hidden");

    const APPLE_SCORE = collected["apple"] * 2;
    const GRAPE_SCORE = collected["grape"] * 3;
    const PEAR_SCORE = (collected["pear"] * (collected["pear"] + 1)) / 2;
    const APPLE_GRAPE_PAIR_SCORE =
        collected["apple"] < collected["grape"]
            ? collected["apple"] * 2
            : collected["grape"] * 2;

    const TOTAL_SCORE =
        APPLE_SCORE + GRAPE_SCORE + PEAR_SCORE + APPLE_GRAPE_PAIR_SCORE;

    score_div.innerHTML = `<label for="total_score" class="lili text-xl">Összes pontszám:</label>
                    <div onclick="toggle_total_score(this)" class="bg-black shadow-black shadow-md w-fit rounded-lg border-black border-solid border-2 float-right px-1.5 ml-2 text-white text-bold cursor-pointer hover:bg-white hover:outline-black hover:outline-solid hover:outline-2 hover:text-black ease-in-out duration-300">
                        <p class="lili text-13 px-1">></p>
                    </div>
                    <div class="float-right">
                        <p class="lili text-xl">${TOTAL_SCORE} pt</p>
                    </div>
                    <div class="grid grid-cols-3 gap-4 w-100 mt-3">
                        <div>
                            <img src="./assets/apple.svg" class="w-6 mb-1">
                            <img src="./assets/grape.svg" class="w-6 mb-1">
                            <img src="./assets/pear.svg" class="w-6 mb-1">
                            <div class="flex gap-2">
                                <img src="./assets/apple.svg" class="w-6 mb-1">
                                <img src="./assets/grape.svg" class="w-6 mb-1">
                            </div>
                        </div>
                        <div>
                            <p class="lili text-lg mb-1">${collected["apple"]} db</p>
                            <p class="lili text-lg mb-1">${collected["grape"]} db</p>
                            <p class="lili text-lg mb-1">${collected["pear"]} db</p>
                            <p class="lili text-lg mb-1">${collected["apple"] < collected["grape"] ? collected["apple"] : collected["grape"]} db</p>
                        </div>
                        <div>
                            <p class="lili text-lg mb-1">${APPLE_SCORE} pt</p>
                            <p class="lili text-lg mb-1">${GRAPE_SCORE} pt</p>
                            <p class="lili text-lg mb-1">${PEAR_SCORE} pt</p>
                            <p class="lili text-lg mb-1">${APPLE_GRAPE_PAIR_SCORE} pt</p>
                        </div>
                    </div>`;
}

function set_difficulty(button) {
    const easy_button = document.getElementById("dif_easy");
    const mid_button = document.getElementById("dif_mid");
    const hard_button = document.getElementById("dif_hard");

    if (button == easy_button) {
        gyumi_fraction = 15;
        energy_multiplier = 1;

        button.classList.add("bg-green-600", "text-white", "border-black");
        button.classList.remove("border-green-600");

        mid_button.classList.remove(
            "bg-amber-600",
            "text-white",
            "border-black",
        );
        mid_button.classList.add("border-amber-600");

        hard_button.classList.remove(
            "bg-red-600",
            "text-white",
            "border-black",
        );
        hard_button.classList.add("border-red-600");
    } else if (button.id == "dif_mid") {
        gyumi_fraction = 20;
        energy_multiplier = 0.7;

        easy_button.classList.remove(
            "bg-green-600",
            "text-white",
            "border-black",
        );
        easy_button.classList.add("border-green-600");

        button.classList.add("bg-amber-600", "text-white", "border-black");
        button.classList.remove("border-amber-600");

        hard_button.classList.remove(
            "bg-red-600",
            "text-white",
            "border-black",
        );
        hard_button.classList.add("border-red-600");
    } else {
        gyumi_fraction = 25;
        energy_multiplier = 0.5;

        easy_button.classList.remove(
            "bg-green-600",
            "text-white",
            "border-black",
        );
        easy_button.classList.add("border-green-600");

        mid_button.classList.remove(
            "bg-amber-600",
            "text-white",
            "border-black",
        );
        mid_button.classList.add("border-amber-600");

        button.classList.add("bg-red-600", "text-white", "border-black");
        button.classList.remove("border-red-600");
    }
}

async function dinoWelcomeSpeech() {
    numberOfRestarts = parseInt(localStorage.getItem("numberOfRestarts"));
    if (!numberOfRestarts) numberOfRestarts = 0;
    if (numberOfRestarts === 0) {
        await typewriterAnimation(
            "Szia! Látom ez az első alkalmad, hogy játszol.",
            true,
        );
        await typewriterAnimation("Kérsz egy rövid bemutatót a játékról?");
        document.getElementById("playerTalk").innerHTML =
            'Kérsz egy rövid bemutatót a játékról? <br> <div class="mx-auto w-fit"><button onClick="gameInstructionSpeech(true)" class="underline mx-2 cursor-pointer">Igen!</button><button onClick="gameInstructionSpeech(false)" class="underline mx-2 cursor-pointer">Nem!</button></div>';
    } else if (numberOfRestarts > 10) {
        await typewriterAnimation(
            "Szerintem már jobban ismered a játékot mint mi. -Kerti Pincék",
            true,
        );
        await typewriterAnimation("M-mi történt?", true);
        await typewriterAnimation("Mondtam valamit??", true);
        await typewriterAnimation("Na mindegy!", true);
        await typewriterAnimation("Jó játékot");
    } else if (numberOfRestarts > 0) {
        await typewriterAnimation(
            "Látom már játszottál. Úgy hiszem, tudod mit kell csinálnod",
        );
    }
}

// Source - https://stackoverflow.com/a/63045131
// Posted by JohanP, modified by community. See post 'Timeline' for change history
// Retrieved 2026-10-06, License - CC BY-SA 4.0
//Igen stack overflowról kaptam le, de talán mükszik
// és igen, mükszik
async function btnClick(btn) {
    return new Promise((resolve) => (btn.onclick = () => resolve())); //majd talán felfogom hogy mi ez
}

async function gameInstructionSpeech(isAccepted) {
    if (isAccepted) {
        await typewriterAnimation(
            "Ebben a játékban gyümölcsöket kell öszzegyűjtened.",
            true,
        );

        await typewriterAnimation(
            "Háromféle gyümölcs van: Alma, Szőlő, Körte.",
            true,
        );

        await typewriterAnimation(
            "Mindig, amikor rákattintasz egy olyan mezőre, amiben van egy gyümölcs, oda fogok menni.",
            true,
        );

        await typewriterAnimation(
            "Viszont vigyázz, mert el tudok fáradni! Ezt azzal tudod elkerülni, hogy megetetsz finom gyümikkel.",
            true,
        );

        await typewriterAnimation(
            "Csak kattints a kívánt gyümire, és el fogom majszolni!",
            true,
        );

        await typewriterAnimation(
            "Ha úgy érzed, hogy elég gyümi van nálad, kattints a 'Játék leállítása' gombra, és meglátod, mennyi pontot értél el!",
            true,
        );

        await typewriterAnimation(
            "Minden gyümi ami nálad van pontokat ér",
            true,
        );

        await typewriterAnimation(
            "Egy alma kettőt, egy szőlő hármat, egy szőlő-alma páros megint kettőt és végül a körték n (n+1) / 2 pontot érnek.",
            true,
        );

        await typewriterAnimation("Elmondjam újra?");
        document.getElementById("playerTalk").innerHTML =
            'Elmondjam újra? <br> <div class="mx-auto w-fit"><button onClick="gameInstructionSpeech(true)" class="underline mx-2 cursor-pointer">Igen!</button><button onClick="gameInstructionSpeech(false)" class="underline mx-2 cursor-pointer">Nem!</button></div>';
    } else {
        await typewriterAnimation("Rendben. Jó játékot!");
    }
}

async function typewriterAnimation(text, isMakeNextButton) {
    if (!is_talking) {
        is_talking = true;
        document.getElementById("nextSpeech").classList.add("hidden");
        const text_len = text.length;
        let to_be_dispalyed = "";
        for (
            let i = 0;
            i < text_len;
            i++, await new Promise((r) => setTimeout(r, 25))
        ) {
            to_be_dispalyed += text[i];
            document.getElementById("dinoTalk").cloneNode(true).play();
            document.getElementById("playerTalk").innerHTML = to_be_dispalyed;
            if (
                text[i] === " " ||
                text[i] === "," ||
                text[i] === "." ||
                text[i] === "!" ||
                text[i] === ":"
            ) {
                await new Promise((r) => setTimeout(r, 50));
                document.querySelectorAll("audio").forEach((el) => el.pause());
            }
            if (i % 2 == 0) {
                document
                    .getElementById("dinoSpeechSVG")
                    .classList.remove("-rotate-5");
                document
                    .getElementById("dinoSpeechSVG")
                    .classList.add("rotate-5");
            } else {
                document
                    .getElementById("dinoSpeechSVG")
                    .classList.remove("rotate-5");
                document
                    .getElementById("dinoSpeechSVG")
                    .classList.add("-rotate-5");
            }
            document.querySelectorAll("audio").forEach((el) => el.pause());
        }
        document.getElementById("dinoSpeechSVG").classList.remove("rotate-5");
        document.getElementById("dinoSpeechSVG").classList.remove("-rotate-5");
        await new Promise((r) => setTimeout(r, 50));
        document.querySelectorAll("audio").forEach((el) => el.pause());
        if (isMakeNextButton) {
            document.getElementById("playerTalk").innerHTML = text;
            document.getElementById("nextSpeech").classList.remove("hidden");
            await btnClick(document.getElementById("nextSpeech")); //wait until BUTTon press
        }
        is_talking = false;
    }
}

function confetti() {
    const conf_div = document.getElementById("confetti_placeholder");

    if ((conf_div.innerHTML == ``) & !is_game_stopped_manually) {
        conf_div.innerHTML = `<div class="confetti_div">
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>

            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>

            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>

            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>
            <div class="confetti"></div>

            </div>`;
    } else {
        conf_div.innerHTML = ``;
    }
}

// TODO:
// Get dino color on refresh
// Make textbox not push field when choice selector is displayed
// Make dino hop between placings
