
var canvas = document.getElementById('canvas-1')
var c = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

var bugArray = []

var score = 0
var health = 9999

var game_paused = false
var window_focused = true


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

/**
 * Bug class, with some functionality such as moving and spawning. Also includes random x spawn.
 */
class Bug {
    constructor(){
        this.x = (Math.random() * (canvas.width - 100)) 
        this.y = 0
        this.speedY = Math.random() * 3 + 1
    }
    move(){
        this.y += this.speedY
        this.x += Math.sin(this.y/ 50)
    }
    spawnBug(){
        c.fillStyle = '#4B3A2F'
        c.beginPath()
        c.arc(this.x, this.y, 25, 0, Math.PI * 2)
        c.fill()
    }
}

var spiderArr = []

/**
 * Spider class. Includes functionality to spawn spiders using c.drawImage, move the spider
 */
class Spider {
    constructor(){
        this.x = (Math.random() * (canvas.width - 100))
        this.sX = 0 
        this.y = 10
        this.speedY = Math.random() * 2 + 1
        this.img = new Image()
        this.img.src = './images/spritesheet.png'
        this.framesDrawn = 0
    }
    move(){
        this.y += this.speedY
        this.x += Math.sin(this.y/50)
        this.framesDrawn++
    }
    spawnSpider(){
        c.drawImage(
            this.img, 
            this.sX,
            0,
            this.img.width / 4,
            this.img.height,
            this.x,
            this.y,
            (this.img.width * .5),
            (this.img.height * 2.5),
        )
    }
}


function createSpider(){
    var spider = new Spider()
    spiderArr.push(spider)
    spider.spawnSpider()
}
createSpider()
// creates a new bug object and pushes it into the main bug array
function createBug() {
    if (!(game_paused)) {
        var bug = new Bug()
        bugArray.push(bug)
        bug.spawnBug()
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
    } else {
        game_paused = true
        document.getElementById('game_paused_screen').classList.remove('hidden')
    }
}

//base interval + interval object that needs to be reset every interval change
var spawnInterval = 1000
var interval = setInterval(createSpider, spawnInterval)



//will move each bug in the bug array, and delete the bug if it reaches the bottom of the screen
function moveBugs(){
    if (!(game_paused)) {
        for(var i = 0; i < bugArray.length; i++){
            bugArray[i].move()
            bugArray[i].spawnBug()
            if(bugArray[i].y + 30 >= window.innerHeight){
                health -= 1
                bugArray.splice(i, 1)
            }
        }
    }
}


//functions like moveBugs, but with the added FPS counter that will shift the animation 16 pixels to the right every 20 frames
function moveSpiders(){
    if(!game_paused){
        for(var i = 0; i < spiderArr.length; i++){
            spiderArr[i].move()
            spiderArr[i].spawnSpider()
            if(spiderArr[i].y + 16 >= window.innerHeight){
                health -= 1
                spiderArr.splice(i, 1)
                
            }
            
            if(spiderArr[i].framesDrawn > 20){
                spiderArr[i].sX += 16
                if(spiderArr[i].sX > 48){
                    spiderArr[i].sX = 0
                }
                spiderArr[i].framesDrawn = 0
            }
        }
    }
}


// the main animation function
function animate(){
    c.clearRect(0, 0, canvas.width, canvas.height)
    moveSpiders()
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
document.addEventListener('click', onClickSpider)

function onClickBug(event){
    for(var i = 0; i < bugArray.length; i++){
        if(isPointValid(bugArray[i], event.x, event.y)){
            bugArray.splice(i, 1)
            score += 10
        }
    }
    if(score % 100 === 0 && health > 0){
        spawnInterval -= 50
        clearInterval(interval)
        interval = setInterval(createBug, spawnInterval)
    }
}

function onClickSpider(event){
    console.log(event.x, event.y)
    for(var i = 0; i < spiderArr.length; i++){
        if(isSpiderValid(spiderArr[i], event.x, event.y)){
            spiderArr.splice(i, 1)
            score += 10
        }
    }
    if(score % 100 === 0 && health > 0){
        spawnInterval -= 50
        clearInterval(interval)
        interval = setInterval(createSpider, spawnInterval)
    }
}

//will check if point clicked is within bug object area, is scaled with speed (slower = smaller hitbox)
function isPointValid(bug, x, y){
    var bugX = bug.x
    var bugY = bug.y
    var radius = 25
    var d = Math.sqrt(Math.pow((x - bugX), 2) + Math.pow((y - bugY), 2))
    return(d <= radius*bug.speedY)
}

function isSpiderValid(spider, x, y){
    var spiderX = spider.x + spider.sX
    var spiderY = spider.y
    var radius = 50
    var d = Math.sqrt(Math.pow((x - spiderX), 2) + Math.pow((y - spiderY), 2))
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
