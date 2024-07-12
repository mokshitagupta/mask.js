import loremText from "./lorem.js"
import {json} from "./proj.js"

console.log(json)
console.log(json)
console.log(json)

let lorem = loremText.replaceAll(/[\s]/g, "")

let encoding = {"e": 1, "d": 0}
let rleRegex = /[^der]+[der]/g
let space = 4
let letterRLE = {
  1: "2d2e2d 1d3e2d 2d2e2d4r 1d4e1d",
  2: "1d4e1d 2e2d2e 4d2e 2d3e1d 1d2e3d 2e4d 6e",
  3: "1d4e1d 2e2d2e 4d2e 2d3e1d 4d2e 2e2d2e 1d4e1d",
  4: "2e2d2e4r 1d5e 4d2e2r",
  5: "6e 2e4d 5e1d 4d2e2r 2e2d2e 1d4e1d",
  6: "1d4e1d 2e2d2e 2e4d 5e1d 2e2d2e2r 1d4e1d",
  7: "6e 4d2e 3d2e1d 2d2e2d4r",
  8: "1d4e1d 2e2d2e2r 1d4e1d 2e2d2e2r 1d4e1d",
  9: "1d4e1d 2e2d2e2r 1d5e 4d2e 2e2d2e 1d4e1d",
  0: "1d4e1d 2e2d2e5r 1d4e1d",
  // "|": "1d1e1d 1d1e1d 1d1e1d 1d1e1d 1d1e1d 1d1e1d 1d1e1d",
  "|": "2d 2d 2d 2d 2d 2d 2d",
  " ": `${space}d ${space}d ${space}d ${space}d ${space}d ${space}d ${space}d`,
  "_": "6d 6d",
}

let letterMap = {}

let cols = 100
let rows = 14
let width = 6
let height = 7
let padding = 1
let matrix = new Array(rows).fill(new Array(cols).fill(0))

function rleToMat(num, rle=letterRLE[num].split(" ")){
  let acc = []
  // console.log(rle)
  for (let i of rle){
    var tokens = i.match(rleRegex);
    let row = []
    for (let j of tokens){
      let dirs = j.match(/[^der]|[der]/g)
      // let num = dirs.slice(0, dirs.length-1).join("")
      dirs[0] = parseInt(dirs.slice(0, dirs.length-1).join(""))
      // console.log(dirs, num)
      let chara = dirs.at(-1)
      if (chara === "r"){
          acc.push(...Array(dirs[0] - 1).fill(row))
      }else {
        // console.log(chara)
        row.push(...Array(dirs[0]).fill(encoding[chara]))
      }
    }
    acc.push(row)
  }  
  return(acc)
}


// TODO: add \n to the matrix itself
function reconstructMatrix(matrixIn){
  // let matrixIn = rleToMat(charIn)
  let reconstructStr = ""
  let colsIn = matrixIn[0].length
  let mat = matrixIn.flat()
  for(let i = 0; i < mat.length; i++){
    let schar = lorem[i]
    reconstructStr += (!mat[i] ? schar : `<span class='activated'>${schar}</span>`) + ((i + 1) % colsIn == 0 ? "\n" : "")
  }
  return reconstructStr
}

Object.keys(letterRLE).map((v) => letterMap[v.toString()] = rleToMat(v))
letterMap = {...json, ...letterMap}
console.log(letterMap)

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function reconstruct(input){
  let inputText = input
  let h = height
  let line = 0 
  let finalMat = Array.from({length: h}, () => [])
  // console.log( finalMat) 
  let offset = 0
  let j;

  for (j=0; j < inputText.length;j++){
    let ch = inputText[j]
    console.log(ch, line)
    if (ch !== "_"){
      let charlookup = ch
      if (isLetter(ch)){
        charlookup =ch + ( ch === ch.toLowerCase() ? "l" : "u")
      }
      var bits = letterMap[charlookup]
      console.log(charlookup, bits)
      // console.log(letterMap["_a"],letterMap["A"])
      // console.log((line*h) +1 + line, finalMat[(line*h) +1 + line].length,finalMat[(line*h) +1 + line].length + bits[0].length, finalMat)
      if (finalMat[(line*h) +1 + line].length + bits[0].length >= cols){
        const deficit = cols - finalMat[(line*h) +1 + line].length
        console.log(deficit, inputText)
        if (deficit > 0){
          let defRLE = new Array(h).fill(deficit + "d").join(" ")
          // console.log("overflow", (line*h) +1, cols - finalMat[(line*h) +1].length, defRLE )
          // cons
          inputText = inputText.slice(0, j) + `_${ch}` +inputText.slice(j+1);
          j-- 
          bits = rleToMat(null, defRLE.split(" "))
          console.log(inputText, inputText[j], ch)
        }
        // fill remaining
        // add new block
      }
      // console.log(ch)
      for (let i=offset; i<bits.length+offset;i++){
        // console.log(bits[i], i, finalMat[i*line])
        console.log(i + (line * h), i-offset, bits[i-offset], finalMat[i + (line * h)])
        finalMat[i + (line * h)].push(...bits[i-offset])
      }
    } else {
      offset++
      let spacer = rleToMat(null, [`${finalMat[0].length > 0 ? finalMat[0].length : cols}d`])
      // console.log(spacer, finalMat)
      if(finalMat[0].length){
        finalMat.push(...spacer)
        line++
        let newMat = Array.from({length: h}, () => [])
        finalMat.push(...newMat)
        console.log( finalMat)
        // finalMat.push([])
        // console.log(finalMat)
      } else {
        // console.log(spacer)
        finalMat = spacer.concat(finalMat)
      }
    }
  }

  console.log(finalMat,cols - finalMat[(line*h) +1 + line].length, line )
  if (cols - finalMat[(line*h) +1 + line].length >0){
    let d = cols - finalMat[(line*h) +1 + line].length
    let j = (line*h) +1 + line
    for (let it = j; it< j+h ;it++){
      console.log(it, "lol")
      finalMat[it].push(...new Array(d).fill(0))
    }
    // fill with padding
  }

  console.log(finalMat)
  return reconstructMatrix(finalMat)
}

let divOfLorem = document.querySelector("#lorem")
// divOfLorem.innerHTML = reconstruct("_2|2|2|2|2|2|2|2|2 7_8|1|2|3|4|5|6|9|0 7_8|1|2|3|4|5|6|9|0 7_")
divOfLorem.innerHTML = reconstruct("_A|a|B|b|C|c|D|d|E|e|F|f|G|g|0|1|2|3|4|5|6|7|8|9")