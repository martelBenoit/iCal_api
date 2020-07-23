var fs = require('fs');

var http = require('http');
var https = require('https');

var ICAL = require('ical.js');

let lastUpdateCal;


function download(url, dest, cb) {
    // on créé un stream d'écriture qui nous permettra
    // d'écrire au fur et à mesure que les données sont téléchargées
    const file = fs.createWriteStream(dest);
    let httpMethod;

    // afin d'utiliser le bon module on vérifie si notre url
    // utilise http ou https
    if (url.indexOf(('https://')) !== -1) httpMethod = https;
    else httpMethod = http;

    // on lance le téléchargement
    const request = httpMethod.get(url, (response) => {
        // on vérifie la validité du code de réponse HTTP
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }

        // écrit directement le fichier téléchargé
        response.pipe(file);

        // lorsque le téléchargement est terminé
        // on appelle le callback
        file.on('finish', () => {
            // close étant asynchrone,
            // le cb est appelé lorsque close a terminé
            file.close(cb);
        });
    });

    // check for request error too
    request.on('error', (err) => {
        fs.unlink(dest);
        cb(err.message);
    });

    // si on rencontre une erreur lors de l'écriture du fichier
    // on efface le fichier puis on passe l'erreur au callback
    file.on('error', (err) => {
        // on efface le fichier sans attendre son effacement
        // on ne vérifie pas non plus les erreur pour l'effacement
        fs.unlink(dest);
        cb(err.message);
    });
}

function getNextLessons(){

    var tabEvenements = [];

    var contents = fs.readFileSync('cal.ics', 'utf8');
    var jCalData = ICAL.parse(contents);
    var comp = new ICAL.Component(jCalData);


    var vevents = comp.getAllSubcomponents("vevent");
    var dt= ((ICAL.Time.now()).toString());

    for (var event of vevents){

        var dateEvent = new Date(event.getFirstPropertyValue("dtstart"));
        if(dateEvent >= new Date(dt)){
            var uid = event.getFirstPropertyValue("uid");
            var nom = event.getFirstPropertyValue("summary");
            var dateDebut = new Date(event.getFirstPropertyValue("dtstart"));
            var userTimezoneOffset = dateDebut.getTimezoneOffset() * 60000;
            dateDebut = new Date(dateDebut.getTime() - userTimezoneOffset);
            var dateFin = new Date(event.getFirstPropertyValue("dtend"));
            userTimezoneOffset = dateFin.getTimezoneOffset() * 60000;
            dateFin = new Date(dateFin.getTime() - userTimezoneOffset);
            var description = event.getFirstPropertyValue("description");
            var id = description.indexOf("Exporté");
            description = description.substring(0,id-2);
            var location = event.getFirstPropertyValue("location");
            var evt = new Event(uid,nom,dateDebut,dateFin,description,location,lastUpdateCal);
            tabEvenements.push(evt);
        }
    }


    tabEvenements.sort(tri);

    return tabEvenements;

}

function getCours(jour){
    var tabEvenements = [];

    var contents = fs.readFileSync('cal.ics', 'utf8');
    var jCalData = ICAL.parse(contents);
    var comp = new ICAL.Component(jCalData);
//	comp = addEvent(comp);

    var vevents = comp.getAllSubcomponents("vevent");
    var dtCours = (((ICAL.Time.now()).adjust(jour,0,0,0)).toString()).substring(0,10);


    for (var event of vevents){

        var dt = event.getFirstPropertyValue("dtstart");
        dt = (dt.toString()).substring(0,10);

        if(dtCours === dt){
            var uid = event.getFirstPropertyValue("uid");
            var nom = event.getFirstPropertyValue("summary");
            var dateDebut = new Date(event.getFirstPropertyValue("dtstart"));
            var userTimezoneOffset = dateDebut.getTimezoneOffset() * 60000;
            dateDebut = new Date(dateDebut.getTime() - userTimezoneOffset);
            var dateFin = new Date(event.getFirstPropertyValue("dtend"));
            userTimezoneOffset = dateFin.getTimezoneOffset() * 60000;
            dateFin = new Date(dateFin.getTime() - userTimezoneOffset);
            var description = event.getFirstPropertyValue("description");
            var id = description.indexOf("Exporté");
            description = description.substring(0,id-2);
            var location = event.getFirstPropertyValue("location");
            var evt = new Event(uid,nom,dateDebut,dateFin,description,location,lastUpdateCal);
            tabEvenements.push(evt);
        }
    }

    tabEvenements.sort(tri);

    return tabEvenements;
}

function Event (uid,nom, dateDebut, dateFin, description, location, updateDate) {

    this.uid = uid;
    this.nom = nom;
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
    this.description = description;
    this.location = location;
    this.updateDate = updateDate;

}

function tri(a,b)
{
    if (a.dateDebut < b.dateDebut) return -1;
    else if (a.dateDebut === b.dateDebut) return 0;
    else return 1;
}

function majCal(){

    download('https://planning.univ-ubs.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=8241fc387320021412235f8096f03f1135f6ddba8e619925a1571e650ed125fe504cdf3c1acef8543cfd5b81b930e6b6cec0db97247709248af069ff1fd12df91073232724b7d9020f7edaf949696a6f2d6d2add87d075e25867616a0c885c2e'
        , 'tmp_cal.ics', (err) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('Téléchargement terminé !');
        fs.copyFile('tmp_cal.ics', 'cal.ics', (err) => {
            if (err) throw err;
            console.log('File was copied to destination');
        });
            lastUpdateCal = new Date();
    });


}

module.exports = {
    getNextLessons,
    majCal,
    getCours
};




