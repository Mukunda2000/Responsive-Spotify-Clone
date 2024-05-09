console.log("Lets do some Javascript")

let Currentsong = new Audio();
let songs;
let Currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    Currfolder = folder;


    let a = await fetch(`/${folder}/`)
    let res = await a.text()
    let div = document.createElement("div")
    div.innerHTML = res
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> 
                        <img class="invert" src="Images/music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Mukunda</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="Images/play.svg" alt="">
                        </div>
                            </li>`;
    }

    // Attach an event listener to each song

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs

}

const playmusic = (track, pause = false) => {
    Currentsong.src = `/${Currfolder}/` + track;
    if (!pause) {

        Currentsong.play();
        play.src = "Images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let res = await a.text()
    let div = document.createElement("div")
    div.innerHTML = res
    let anchors = div.getElementsByTagName("a")
    let Cardcontainer = document.querySelector(".Cardcontainer");
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            // console.log(e.href)
            let folder = e.href.split("/").slice(-2)[0]

            //get the metadata of the folder

            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response);

            Cardcontainer.innerHTML = Cardcontainer.innerHTML + `<div data-folder="${folder}" class="card  ">
            <div class="play">
                <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"
                    class="Svg-sc-ytk21e-0 bneLcE">
                    <path
                        d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                    </path>
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`

        }
    }

// play the music auto as one by one from the albums




    // Load the playlist whenever card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })


}


async function main() {

    // Get the list of all the songs

    await getSongs("songs/cs")
    // console.log(songs)
    playmusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums();

    // Attach an event listener to play, next and previous

    play.addEventListener("click", element => {
        if (Currentsong.paused) {
            Currentsong.play()
            play.src = "Images/pause.svg"
        }
        else {
            Currentsong.pause()
            play.src = "Images/play.svg"
        }
    })
    // Listen for timeupdate event

    Currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(Currentsong.currentTime)} / ${secondsToMinutesSeconds(Currentsong.duration)}`
        document.querySelector(".circle").style.left = (Currentsong.currentTime / Currentsong.duration) * 99 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        Currentsong.currentTime = (percent / 100) * Currentsong.duration;
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener to close

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        Currentsong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(Currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        Currentsong.pause()
        console.log("Next clicked")
        let index = songs.indexOf(Currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        Currentsong.volume = parseInt(e.target.value) / 100

        if (Currentsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            Currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            Currentsong.volume = .20;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }

    })

}

main()






