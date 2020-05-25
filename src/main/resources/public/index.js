// populate these two fields based on your local dev environment
const localIP = "192.168.56.1";
const port = "8888";
const teamsUrlIdentifier = ".teams-url";
const rocketChatUrlIdentifier = ".rocket-chat-url";


// ######################## HTML Element Functions ########################### //
function createNewUrlInput(urlType) {
    const id = Math.floor(Math.random() * 100000);
    let txtNewInputBox = document.createElement('div');
    txtNewInputBox.setAttribute("id", id);
    txtNewInputBox.innerHTML = "<br/><input type='text' style='margin-right: 4px' class='" + urlType + "'><button type='button' onclick='deleteUrl(" + id + ")'>Remove URL</button>";
    document.getElementById("add-" + urlType + "-here").appendChild(txtNewInputBox);
}

function deleteUrl(elementId) {
    const element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}


// ######################## URL Generation Functions ########################### //
function generateUrls(splunkWebHookUrls, urlType, chatType) {
    // loops through urls
    for (let i = 0; i < $(urlType).length; i++) {
        const urlValue = $(urlType).eq(i).val();

        // if no url entered, return empty
        if (!urlValue) return "empty";

        // if url entered but incorrect, return false
        if (!validateUrl(urlValue)) return false;

        // Create object
        const chatAppUrl = {
            "chatApp": chatType,
            "url": urlValue
        };

        // Push object to the array if doesn't already exist
        if (!checkForDuplicates(splunkWebHookUrls, chatAppUrl)) splunkWebHookUrls.push(chatAppUrl);
    }

    return splunkWebHookUrls;
}

function generateWebHookUrlString() {
    let webHookUrls = {};
    let splunkWebHookUrls = [];
    const generatedTeamsUrl = generateUrls(splunkWebHookUrls, teamsUrlIdentifier, "TEAMS");
    const generatedRocketUrl = generateUrls(splunkWebHookUrls, rocketChatUrlIdentifier, "ROCKET_CHAT");

    if ((generatedTeamsUrl === "empty" && generatedRocketUrl === "empty") || (typeof generatedTeamsUrl === "boolean" && typeof generatedRocketUrl === "boolean")) {
        $(".error").show();
        return false;
    }

    if (generatedTeamsUrl && !generatedRocketUrl) {
        $(".url-error-rocket").show();
        return false;
    }

    if (generatedRocketUrl && !generatedTeamsUrl) {
        $(".url-error-teams").show();
        return false;
    }

    webHookUrls.splunkWebHookUrls = splunkWebHookUrls;
    return JSON.stringify(webHookUrls);
}

function generateFinalUrl() {
    // temporarily for local dev
    const baseUrl = `http://${localIP}:${port}/splunk/alert/`;
    const token = $(".token").val();
    const webHookUrlString = generateWebHookUrlString();

    if ($(".url-error-teams").is(":visible") || $(".url-error-rocket").is(":visible") || !webHookUrlString) return false;

    const finalUrl = `${baseUrl}${token}/${base64EncodeString(webHookUrlString)}`;
    document.getElementById("final-url").innerHTML = finalUrl;

    // display the url
    $("#final-url-div").show();
}


// ######################## Helper Functions ########################### //
function base64EncodeString(string) {
    return btoa(string).replace('+', '-').replace('/', '_').replace(/=+$/, '');
}

function validateUrl(url) {
    if (!url) return false;

    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
}

function checkForDuplicates(array, obj) {
    let duplicatesExist = false;

    array.forEach(element => {
        if (element.chatApp === obj.chatApp && element.url === obj.url) duplicatesExist = true;
    });

    return duplicatesExist;
}
