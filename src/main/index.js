var input = document.querySelector(".textSource");
var show = document.querySelector(".showEndResult");

var language = "pt";

var textShowSpeed = 200;


var isVercel = false;

var alfabet;
axios.get("/getTitles", {
        params: {
        lang: "alfabet"
    }
}).
then(res => alfabet = res.data).
catch(() => isVercel = true);


var imagesArr = [];


document.querySelector(".send").addEventListener("click", async () => {
    if(!input.value) return

    // systems words: space, SW_error
    var wiritten = input.value.
        normalize("NFD").
        replace(/[\u0300-\u036f]/g, "").
        toLowerCase().
        replaceAll(" ", " SW_space ").
        split(" ");
    var showList = [];

    if(!isVercel){
        var wordList;
        await axios.get("/getTitles", {
            params: {
                lang: language
            }
        }).
        then(res => wordList = res.data);
        
        var dir = "./images/";
        wiritten.forEach(word => {
            var findWord = wordList.find(w => w == word);
            var findWordInAlfabe = alfabet.find(w => w == word);

            if(findWord){
                showList.push({
                    url: dir+language+"/"+findWord+".png",
                    time: findWord.length
                });

            } else if(findWordInAlfabe){
                showList.push({
                    url: dir+"alfabet/"+findWordInAlfabe+".png",
                    time: 1
                });

            } else {
                var writtenLetter = word.split("");
                
                writtenLetter.forEach(letter => {
                    var findLetter = alfabet.find(l => l == letter);

                    var url;
                    var time;
                    var error;
                    if(findLetter){
                        url = dir+"alfabet/"+findLetter+".png";
                        time = 1;
                    } else {
                        url = dir+"alfabet/"+"SW_error.png";
                        time = 4;
                        error = letter;
                    }
                    
                    showList.push({
                        url,
                        time,
                        error
                    });
                });
            }
        });
        
    } else {
        var dir = "/images/" ;
        for(word in wiritten){
            await fetch(dir + language + "/" + word + ".png").
            then(res => res.blob()).
            then(imageBlob => {
                var imageUrl = URL.createObjectURL(imageBlob);

                showList.push({
                    url: imageUrl,
                    time: word.length
                });

            }).
            catch(() => {
                var writtenLetter = word.split("");
                
                for(letter in writtenLetter){
                    await fetch(dir + "alfabet/" + letter + ".png").
                    then(resL => resL.blob()).
                    then(imageBlobL => {
                        var imageUrl = URL.createObjectURL(imageBlobL);
        
                        showList.push({
                            url: imageUrl,
                            time: 1
                        });
        
                    }).
                    catch(() => {
                        await fetch(dir + "alfabet/SW_error.png").
                        then(resE => resE.blob()).
                        then(imageBlobE => {
                            var imageUrl = URL.createObjectURL(imageBlobE);
            
                            showList.push({
                                url: imageUrl,
                                time: 4,
                                error: letter
                            });
                        });
                    });
                }
            });
        }
    }

    loadImages(showList);
});

var imagesLoaded;
const loadImages = (list) => {
    console.log(list);
    imagesArr = [];
    imagesLoaded = 0;

    list.forEach(image => {
        var img = new Image();
            img.src = image.url;
            img.onload = () => loadImage(list);
        
        imagesArr.push({
            img,
            time: image.time,
            error: image.error
        });
    });

    show.innerHTML = "Carregando imagens...";
}

var showingIndex;
const loadImage = (arr) => {
    if(++imagesLoaded == arr.length){
        showingIndex = 0;
        showImages();
    }
}

const showImages = () => {
    var imgEl = imagesArr[showingIndex];
    show.innerHTML = "";
    show.append(imgEl.img);

    if(imgEl.error != undefined)
        show.append('Caractere "'+imgEl.error+'" não existe no Banco de Dados!');

    setTimeout(() => {
        if(showingIndex < imagesArr.length){
            showImages();
        } else {
            show.innerHTML = "";
        }
    }, imgEl.time * textShowSpeed);
    showingIndex++;
} 