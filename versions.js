//link this to wherever the latest JSON obj is being stored
const sites = JSON.parse(Get("https://s3.us-east-2.amazonaws.com/outagechecker.com/cloudcrd_organizations.json"));

document.getElementById("PAT").placeholder = "Enter Persistent Access Token Here"

//This function is responsible for creating the site. It separates functions to make it easier to modify.
function onLanding(){
    createInitialTable();
    checkSitesStatus();
}

//This function creates the initial table to hold the places for all of the pieces
//It runs through the Json object and creates 3 rows, pending(status placeholder),name,and identifier
function createInitialTable() {
    const tbl = document.getElementById('initial-table')

    let i = 0
    sites.forEach(site => {
        //Uses a parity bit to control the coloring of even and odd rows
        let parityClass = i % 2 == 0 ? 'even-row' : 'odd-row'
        tbl.innerHTML += `<tr class="${parityClass}">
                            <td id="${site.identifier}-status">pending</td>
                            <td id="${site.identifier}-name">${site.name}</td>
                            <td id="${site.identifier}-name">${site.identifier}</td>
                          </tr>`
        i++
    })
}

//checkSitesStatus iterates through the list of schools and makes a fetch request to each URL.
//It takes these responses and creates a font based off of it.
async function checkSitesStatus() {
    let sitesUp = 0;
    let sitesDown = 0
    let sitesError = 0;

    for(const site of sites){
        try {
            const response = await fetch(site.siteurl, {method: "GET", redirect: "error"})
            if(response.ok){
                console.log("Response for: " + site.siteurl + " " + response.status)
                let responseStatus = response.status;
                //parse the HTML file to extract the title
                const html = await response.text();
                //passes the html to a seperate function to be handled
                const title = getTitleFromHTML(html);

                //This should catch any errors that occur, such as a bad url, no url, improper url
                try{
                    if(title == "Site Maintenance"){
                        console.log("Title: ", title)
                        document.getElementById(site.identifier + "-status").innerHTML = `
                                                                                <div class="flip-card">
                                                                                    <div class="flip-card-inner">
                                                                                        <div class="flip-card-front">  
                                                                                            <button class="button">
                                                                                                <i class="fa-solid fa-screwdriver-wrench icon-up"></i>
                                                                                            </button>
                                                                                        </div>
                                                                                        <div class="flip-card-back">    
                                                                                            ${responseStatus}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>`
                    } else {
                        document.getElementById(site.identifier + "-status").innerHTML = `
                                                                                <div class="flip-card">
                                                                                    <div class="flip-card-inner">
                                                                                        <div class="flip-card-front">  
                                                                                            <button class="button">
                                                                                                <i class="fa-solid fa-angles-up icon-up"></i>
                                                                                            </button>
                                                                                        </div>
                                                                                        <div class="flip-card-back">    
                                                                                            ${responseStatus}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>`
                    }
                } catch (error){
                    console.log("No HTML Title found on requested page")
                }

                sitesUp++
            } else {
                console.log("Response was bad. Status: " + response.status)
                let errorResponseStatus = response.status;
                sitesDown++
                document.getElementById(site.identifier + "-status").innerHTML = `
                                                                                <div class="flip-card">
                                                                                    <div class="flip-card-inner">
                                                                                        <div class="flip-card-front">  
                                                                                            <button class="button">
                                                                                                <i class="fa-solid fa-arrows-down-to-line icon-down"></i>
                                                                                            </button>
                                                                                        </div>
                                                                                        <div class="flip-card-back">    
                                                                                            ${errorResponseStatus}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>`
            }
        } catch (error){
            //spit out all of the possible error information
            console.log("Error Retrieving. Error", error, Object.keys(error))
            for(var key in Object.keys(error)) {
                var value = error[key];
                console.log(key, value)
            }
            sitesError++
            document.getElementById(site.identifier + "-status").innerHTML = `
                                                                                <div class="flip-card">
                                                                                    <div class="flip-card-inner">
                                                                                        <div class="flip-card-front">  
                                                                                            <button class="button">
                                                                                                <i class="fa-solid fa-triangle-exclamation icon-warning"></i>
                                                                                            </button>
                                                                                        </div>
                                                                                        <div class="flip-card-back">    
                                                                                            Warning (check console log)
                                                                                        </div>
                                                                                    </div>
                                                                                </div>`
        }
    }

    //these 3 chunks create the buttons in order to filter through all error codes
    document.getElementById("status-up").innerHTML +=
        `<input type="button" value=${sitesUp} onclick="filterUp()" />`

    document.getElementById("status-down").innerHTML +=
        `<input type="button" value=${sitesDown} onclick="filterDown()" />`

    document.getElementById("status-unknown").innerHTML +=
        `<input type="button" value=${sitesError} onclick="filterUnknown()" />`

}

//This function is called when the "Load Urls" button is called
function Upload(){
    var pat = document.getElementById("PAT").value
    console.log(pat)
    sites.forEach(site => {
        console.log(site)
        var cell = document.getElementById(site.identifier + "-name")
        cell.innerHTML = `<a href=${site.siteurl}login?access_token=${pat}>${site.name}</a>`
    })
}


function jsonTest() {
    var pat = document.getElementById("PAT").value
    console.log('upload clicked')
    console.log(pat)
    var json_obj = JSON.parse(Get("https://s3.amazonaws.com/versions.onlinephotosubmission.com/sites.json"))

    // Make a container element for the list
    listContainer = document.createElement('div'),

        // Make the list
        listElement = document.createElement('ul'),

        // Set up a loop that goes through the items in listItems one at a time
        numberOfListItems = json_obj.length

    var listItem
    var a

    document.getElementsByTagName('body')[0].appendChild(listContainer)
    listContainer.appendChild(listElement)

    for (i = 0; i < numberOfListItems; ++i) {
        // Create an item for each one
        console.log(json_obj[i].name)
    }

}

//get function for URLS (maybe better alternative than fetch
function Get(yourUrl) {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", yourUrl, false)
    Httpreq.send(null)
    return Httpreq.responseText
}

// Function to extract title from HTML using DOMParser
function getTitleFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const titleElement = doc.querySelector("title");
    return titleElement ? titleElement.textContent : null;
}

//functions to filter by response
function filterUp(){
    console.log("filtering up")
    let table = document.getElementById("initial-table")
    let rows = table.getElementsByTagName("tr")

    for(let i = 1; i < rows.length; i++) {
        let statusCell = rows[i].getElementsByTagName("td")[0]
        if(statusCell && statusCell.innerHTML.includes('icon-up')){
            rows[i].style.display = ""
        } else {
            rows[i].style.display = "none"
        }
    }

}

function filterDown(){
    console.log("filtering down")
    let table = document.getElementById("initial-table")
    let rows = table.getElementsByTagName("tr")

    for(let i = 1; i < rows.length; i++) {
        let statusCell = rows[i].getElementsByTagName("td")[0]
        if(statusCell && statusCell.innerHTML.includes('icon-down')){
            rows[i].style.display = ""
        } else {
            rows[i].style.display = "none"
        }
    }

}

function filterUnknown(){
    console.log("filtering unknown")
    let table = document.getElementById("initial-table")
    let rows = table.getElementsByTagName("tr")

    for(let i = 1; i < rows.length; i++) {
        let statusCell = rows[i].getElementsByTagName("td")[0]
        if(statusCell && statusCell.innerHTML.includes('icon-warning')){
            rows[i].style.display = ""
        } else {
            rows[i].style.display = "none"
        }
    }

}

function clearFilter(){
    console.log("Clear filters")
    let table = document.getElementById("initial-table")
    let rows = table.getElementsByTagName("tr")
    for(let i = 1; i < rows.length; i++) {
        rows[i].style.display = ""
    }
}