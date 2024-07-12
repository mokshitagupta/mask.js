var box = document.getElementById("writing-grid");
let w = 6
let h = 7
box.style = "--h:7; --w:6;"


function makeCopy(org){
    return org.map(function(arr) {
        return arr.slice();
    });
}

const jsonPre = "data:application/json;charset=utf-8;base64,"
var dataUri = jsonPre;

let gridInternal = Array.from({length:h}, () => Array.from({length: w}, () => 0))
let cleared = makeCopy(gridInternal)
let letterMapCustom = {}

function renderClear () {
    box.innerHTML = ""
    gridInternal = makeCopy(cleared)
    for (let i = 0; i < h ; i++){
        for ( let j = 0; j < w; j++){
            let pixel = document.createElement("button")
            pixel.classList.add("grid-box")
            pixel.setAttribute("x", j)
            pixel.setAttribute("y", i)
            pixel.onclick = (e) => {
                e.target.classList.toggle("selected")
                let y = e.target.getAttribute("y")
                let x = e.target.getAttribute("x") 
                gridInternal[y][x] = gridInternal[y][x] == 1 ? 0 : 1
                console.log(gridInternal)
            }
            box.appendChild(pixel)
        }
    }
}

renderClear()


function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function submitit(e){
    console.log("hi")
    let label = document.querySelector("#label")
    if (label.value.length <= 0){
        alert("Please add a label before submitting")
        return
    }
    let ch = label.value
    if (isLetter(ch)){
        ch += ch === ch.toLowerCase() ? "l" : "u"
    }

    var newArray = makeCopy(gridInternal)

    letterMapCustom[ch] = newArray
    console.log(letterMapCustom)
    label.value = ""
}

console.log(cleared)
document.querySelector("#submit").addEventListener("click", submitit, false)
document.querySelector("#save").addEventListener("click", save, false)
document.querySelector("#clear").addEventListener("click", renderClear, false)

function save(){
    let a = document.createElement("a")
    a.download = "proj.json" 
    a.href = jsonPre + btoa(JSON.stringify(letterMapCustom))
    a.click()
    // let i = 0
}

// document.getElementById("top-cont").appendChild(box)