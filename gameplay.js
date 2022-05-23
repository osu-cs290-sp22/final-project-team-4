
var canvas = document.getElementById('canvas-1')
var c = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

var bugArray = []

var score = 0
var health = 9999

var game_paused = false
var window_focused = true

var homeButton = document.getElementById('home-button')

homeButton.addEventListener('click', function(){
    window.location.href='./index.html'
})

//draws score in top right

function drawScore() {
    document.getElementById('score_text').innerHTML = (`Score: ${score}`)
}

//draws health in top left
function drawHealth() {
    document.getElementById('health_text').innerHTML = (`Health: ${health}`)
}

drawHealth()
drawScore()

//Spider object
var Spider = {
    imageSrc: "./images/spider_spritesheet.png",
    widthScale: .5,
    heightScale: 2.5,
    totalFrames: 4,
    sX_multiplier: 16
}

/**
 * Main bug class. Abstraction allows for input of different insect objects.
 */
class Bug {
    constructor({ imageSrc, widthScale, heightScale, totalFrames, sX_multiplier }){
        this.x = (Math.random() * (canvas.width - 100))
        this.sX = 0
        this.y = 10
        this.speedY = Math.random() * 2 + 1
        this.img = new Image()
        this.img.src = imageSrc
        this.framesDrawn = 0

        this.widthScale = widthScale
        this.heightScale = heightScale
        this.totalFrames = totalFrames
        this.sX_multiplier = sX_multiplier
    }
    destructor(){
      this.img.src = './images/smoosh_16x64.png'
      this.sX = 0
      this.framesDrawn = 0
    }
    move(){
        this.y += this.speedY
        this.x += Math.sin(this.y/50)
        this.framesDrawn++
    }
    spawnBug(){
        c.drawImage(
            this.img,
            this.sX,
            0,
            this.img.width / this.totalFrames,
            this.img.height,
            this.x,
            this.y,
            (this.img.width * this.widthScale),
            (this.img.height * this.heightScale),
        )
    }
}

// creates a new bug object and pushes it into the main bug array
function createBug(insect) {
    if (!(game_paused)) {
        var i = new Bug(Spider)
        bugArray.push(i)
        i.spawnBug()
    }
}

// changes game state based on pause button
var pause_button = document.getElementsByClassName('pause_button')[0]
// if game is paused, unpause it, if game is unpaused, pause it
pause_button.addEventListener('click', toggle_game_paused)

function toggle_game_paused() {
    if (game_paused) {
        game_paused = false
        document.getElementById('game_paused_screen').classList.add('hidden') 
        document.querySelector(".play-pause-img").src = "./images/pause_white.png"
    } else {
        game_paused = true
        document.getElementById('game_paused_screen').classList.remove('hidden')
        document.querySelector(".play-pause-img").src = "./images/play_white.png"
    }
}

//base interval + interval object that needs to be reset every interval change
var spawnInterval = 1000
var interval = setInterval(createBug, spawnInterval)



/**
 * Will move each bug in the bug array, and delete the bug if it reaches the bottom of the screen
 * This function will also animate the bugs by increasing bug.sX. 
 */
function moveBugs(){
    if (!(game_paused)) {
        for(var i = 0; i < bugArray.length; i++){
            bugArray[i].move()
            bugArray[i].spawnBug()
            
            if(bugArray[i].framesDrawn > 20){
                bugArray[i].sX += bugArray[i].sX_multiplier
                if(bugArray[i].sX > (bugArray[i].sX_multiplier * (bugArray[i].totalFrames - 1))){
                    console.log((bugArray[i].sX_multiplier * (bugArray[i].totalFrames - 1)))
                    bugArray[i].sX = 0
                    
                }
                bugArray[i].framesDrawn = 0
            }
            if(bugArray[i].y + 30 >= window.innerHeight){
                health -= 1
                bugArray.splice(i, 1)
            }
            
            
        }
    }
}


// the main animation function
function animate(){
    c.clearRect(0, 0, canvas.width, canvas.height)
    moveBugs()
    drawHealth()
    drawScore()
    if(health > 0) {
        requestAnimationFrame(animate)
    }else{
        clearInterval(interval)
    }
}

animate()

//click event listener
document.addEventListener('click', onClickBug)

//Main click event function. Calls isPointValid to check whether click hits a bug, and resets spawn interval if score hits a certain thershold
function onClickBug(event){
    for(var i = 0; i < bugArray.length; i++){
        if(isPointValid(bugArray[i], event.x, event.y)){
            bugArray.splice(i, 1)
            score += 10
        }
    }
    if((score % 100 === 0 && score !== 0) && health > 0){
        spawnInterval -= 50
        clearInterval(interval)
        interval = setInterval(createBug, spawnInterval)
    }
}


//uses distance formula to determine if point is within bugs radius
function isPointValid(bug, x, y){
    var bugX = bug.x + bug.sX
    var bugY = bug.y
    var radius = 50
    var d = Math.sqrt(Math.pow((x - bugX), 2) + Math.pow((y - bugY), 2))
    return(d <= radius)
}

window.onfocus = function() {
    window_focused = true
}

window.onblur = function() {
    window_focused = false
}

function pause_if_unfocused() {
    if (!(window_focused)) {
        if (!(game_paused)) {
            toggle_game_paused()
        }
    }
}

var check_focus_interval = setInterval(pause_if_unfocused, 500)
