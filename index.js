const express = require("express");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');
const ejs=require('ejs');

const {Client} = require('pg');
const AccesBD = require("./module_proprii/accesbd.js");

const formidable = require("formidable");
const {Utilizator} = require("./module_proprii/utilizator.js");
const session = require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");

const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const mongodb = require('mongodb');
const helmet = require('helmet');
const xmljs = require('xml-js');

const request = require("request");


AccesBD.getInstanta().select({
    tabel: "cars", campuri: ['marca', 'pret', 'caroserie'], conditiiAnd: ["pret > 10000"]
}, function (err, rez) {
    console.log(err);
    console.log(rez);
});


var client = new Client({
    database: "dbtest", user: "danitns", password: "parolaTW", host: "localhost", port: 5432
});
client.connect();


obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu: null,
    optiuniTransmisie: null,
    produseCarousel: null,
    protocol: "http://",
    numeDomeniu: "localhost:8080",
    clientMongo: mongodb.MongoClient,
    bdMongo: null
}

client.query("select * from unnest(enum_range(null::tip_caroserie))", function (err, rezCategorie) {
    if (err) {
        console.log(err);
    } else {
        let vOptiuni = [];
        for (let categ of rezCategorie.rows) {
            vOptiuni.push(categ.unnest);
        }
        obGlobal.optiuniMeniu = vOptiuni;
    }
});

client.query("select * from cars", function (err, rezProduse) {
    if (err) {
        console.log(err);
    } else {
        let vProduse = [];
        for(let prod of rezProduse.rows) {
            vProduse.push(prod);
        }
        console.log("aaaaa");
        obGlobal.produseCarousel = vProduse;
        console.log(vProduse);
        console.log("aaaaa");
    }

});

client.query("select * from unnest(enum_range(null::tip_transmisie))", function (err, rezCategorie) {
    if (err) {
        console.log(err);
    } else {
        let vOptiuni = [];
        for (let categ of rezCategorie.rows) {
            vOptiuni.push(categ.unnest);
        }
        obGlobal.optiuniTransmisie = vOptiuni;
        console.log(obGlobal.optiuniTransmisie[0]);
    }
});

app = express();
console.log("Folder Proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

var url = "mongodb://localhost:27017";//pentru versiuni mai vechi de Node
var url = "mongodb://0.0.0.0:27017";

obGlobal.clientMongo.connect(url, function (err, bd) {
    if (err) console.log(err); else {
        obGlobal.bdMongo = bd.db("proiect_web");
    }
});

app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true, saveUninitialized: false
}));

vectorFoldere = ["temp", "backup", "poze_uploadate"]
for (let folder of vectorFoldere) {
    // let caleFolder = __dirname + "/" + folder;
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

function compileazaScss(caleScss, caleCss) {
    console.log("cale:", caleCss);
    if (!caleCss) {
        // let vectorCale = caleScss.split("\\");
        // let numeFisExt = vectorCale[vectorCale.length - 1];
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0];
        caleCss = numeFis + ".css";
    }
    if (!path.isAbsolute(caleScss)) caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss)) caleCss = path.join(obGlobal.folderCss, caleCss);
    // let vectorCale = caleCss.split("\\");
    // numeFisCss = vectorCale[vectorCale.length - 1];

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, {recursive: true});
    }

    let numeFisCss = path.basename(caleCss);

    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, numeFisCss))
    }
    rez = sass.compile(caleScss, {sourceMap: true});
    fs.writeFileSync(caleCss, rez.css)
}

vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) === ".scss") {
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    console.log(eveniment, numeFis);
    if (numeFis[numeFis.length - 1] === "~" || path.extname(numeFis) !== "scss") return;
    if (eveniment === "change" || eveniment === "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
})

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.use("/*", function (req, res, next) {
    res.locals.optiuniMeniu = obGlobal.optiuniMeniu;
    res.locals.Drepturi = Drepturi;
    if (req.session.utilizator) {
        req.utilizator = res.locals.utilizator = new Utilizator(req.session.utilizator);
    }

    next();
});

// pt cos virtual
app.use(["/produse_cos", "/cumpara"], express.json({limit: '2mb'}));//obligatoriu de setat pt request body de tip json

app.use(["/contact"], express.urlencoded({extended: true}));

app.use(/^\/resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req, res) {
    afisareEroare(res, 403);
});

app.get("/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/resurse/imagini/ico/favicon.ico");
})

app.get(["/index", "/", "/home", "/login"], async function (req, res) {
    let sir = req.session.succesLogin;
    req.session.succesLogin = null;
    res.render("pagini/index", {ip: req.ip, a: 10, b: 10, imagini: obGlobal.obImagini.imagini, mesajLogin: sir, produse: obGlobal.produseCarousel});

});

app.get("/produse", function (req, res) {


    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul tip_combustibil

    client.query("select * from unnest(enum_range(null::tip_combustibil))", function (err, rezCategorie) {
        if (err) {
            console.log(err);
        } else {
            let conditieWhere = "";

            if (req.query.tip) conditieWhere = ` where caroserie='${req.query.tip}' `

            client.query("select * from cars" + conditieWhere, function (err, rez) {
                if (err) {
                    console.log(err);
                    afisareEroare(res, 2);
                } else {
                    res.render("pagini/produse", {
                        produse: rez.rows, optiuni: rezCategorie.rows, opt_transimie: obGlobal.optiuniTransmisie
                    });
                }

            });
        }
    });
});


app.get("/produs/:id", function (req, res) {
    console.log(req.params);

    client.query(`select * from cars where id = ${req.params.id}`, function (err, rezultat) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        } else res.render("pagini/produs", {prod: rezultat.rows[0]});
    });
});

app.post("/login", function (req, res) {
    var username;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {
        Utilizator.getUtilizDupaUsername(campuriText.username, {
            req: req, res: res, parola: campuriText.parola
        }, function (u, obparam) {
            let parolaCriptata = Utilizator.criptareParola(obparam.parola);
            if (u.parola == parolaCriptata && u.confirmat_mail) {
                u.poza = u.poza ? path.join("poze_uploadate", u.username, u.poza) : "";
                obparam.req.session.utilizator = u;

                obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                //obparam.res.render("/login");
            } else {
                console.log("Eroare logare")
                obparam.req.session.mesajLogin = "Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});

/******************Administrare utilizatori */
app.get("/useri", function(req, res){

    if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
        AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows});
        });
    }
    else{
        afisareEroare(res, 403);
    }
});


app.post("/sterge_utiliz", function(req, res){
    if(req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)){
        var formular= new formidable.IncomingForm();

        formular.parse(req,function(err, campuriText, campuriFile){

            AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${campuriText.id_utiliz}`]}, function(err, rezQuery){
                console.log(err);
                res.redirect("/useri");
            });
        });
    }else{
        afisareEroare(res,403);
    }
})


// ^\w+\.ejs$
app.get("/*.ejs", function (req, res) {
    afisareEroare(res, 400);
})

// app.get("/despre", function(req, res){
//     res.render("pagini/despre");
// });

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////Cos virtual
app.post("/produse_cos", function (req, res) {
    console.log(req.body);
    if (req.body.ids_prod.length != 0) {
        //TO DO : cerere catre AccesBD astfel incat query-ul sa fi `select nume, descriere, pret, gramaj, imagine from prajituri where id in (lista de id-uri)`
        AccesBD.getInstanta().select({
            tabel: "cars",
            campuri: "marca,model,pret,km,poza".split(","),
            conditiiAnd: [`id in (${req.body.ids_prod})`]
        }, function (err, rez) {
            if (err) res.send([]); else res.send(rez.rows);
        });
    } else {
        res.send([]);
    }

});


cale_qr = __dirname + "/resurse/imagini/qrcode";
if (fs.existsSync(cale_qr)) fs.rmSync(cale_qr, {force: true, recursive: true});
fs.mkdirSync(cale_qr);
client.query("select id from cars", function (err, rez) {
    for (let prod of rez.rows) {
        let cale_prod = obGlobal.protocol + obGlobal.numeDomeniu + "/produs/" + prod.id;
        //console.log(cale_prod);
        QRCode.toFile(cale_qr + "/" + prod.id + ".png", cale_prod);
    }
});

async function genereazaPdf(stringHTML, numeFis, callback) {
    const chrome = await puppeteer.launch();
    const document = await chrome.newPage();
    console.log("inainte load")
    await document.setContent(stringHTML, {waitUntil: "load"});

    console.log("dupa load")
    await document.pdf({path: numeFis, format: 'A4'});
    await chrome.close();
    if (callback) callback(numeFis);
}

app.post("/cumpara", function (req, res) {
    console.log(req.body);
    console.log("Utilizator:", req?.utilizator);
    console.log("Utilizator:", req?.utilizator?.rol?.areDreptul?.(Drepturi.cumparareProduse));
    console.log("Drept:", req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse));
    if (req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse)) {
        AccesBD.getInstanta().select({
            tabel: "cars", campuri: ["*"], conditiiAnd: [`id in (${req.body.ids_prod})`]
        }, function (err, rez) {
            if (!err && rez.rowCount > 0) {
                console.log("produse:", rez.rows);
                let rezFactura = ejs.render(fs.readFileSync("./views/pagini/factura.ejs").toString("utf-8"), {
                    protocol: obGlobal.protocol,
                    domeniu: obGlobal.numeDomeniu,
                    utilizator: req.session.utilizator,
                    produse: rez.rows
                });
                console.log(rezFactura);
                let numeFis = `./temp/factura${(new Date()).getTime()}.pdf`;
                genereazaPdf(rezFactura, numeFis, function (numeFis) {
                    mesajText = `Stimate ${req.session.utilizator.username} aveti mai jos rezFactura.`;
                    mesajHTML = `<h2>Stimate ${req.session.utilizator.username},</h2> aveti mai jos rezFactura.`;
                    req.utilizator.trimiteMail("Factura", mesajText, mesajHTML, [{
                        filename: "factura.pdf", content: fs.readFileSync(numeFis)
                    }]);
                    res.send("Totul e bine!");
                });
                rez.rows.forEach(function (elem) {
                    elem.cantitate = 1
                });
                let jsonFactura = {
                    data: new Date(), username: req.session.utilizator.username, produse: rez.rows
                }
                if (obGlobal.bdMongo) {
                    obGlobal.bdMongo.collection("facturi").insertOne(jsonFactura, function (err, rezmongo) {
                        if (err) console.log(err); else console.log("Am inserat factura in mongodb");

                        obGlobal.bdMongo.collection("facturi").find({}).toArray(function (err, rezInserare) {
                            if (err) console.log(err); else console.log(rezInserare);
                        })
                    })
                }
            }
        })
    } else {
        res.send("Nu puteti cumpara daca nu sunteti logat sau nu aveti dreptul!");
    }

});

app.get("/grafice", function (req, res) {
    if (!(req?.session?.utilizator && req.utilizator.areDreptul(Drepturi.vizualizareGrafice))) {
        afisEroare(res, 403);
        return;
    }
    res.render("pagini/grafice");

})

app.get("/update_grafice", function (req, res) {
    obGlobal.bdMongo.collection("facturi").find({}).toArray(function (err, rezultat) {
        res.send(JSON.stringify(rezultat));
    });
})

///////////////////////// Utilizatori

app.post("/inregistrare", function (req, res) {
    var username;
    var poza;
    console.log("ceva");
    var formular = new formidable.IncomingForm()
    formular.parse(req, function (err, campuriText, campuriFisier) {//4
        console.log("Inregistrare:", campuriText);

        console.log(campuriFisier);
        var eroare = "";

        var utilizNou = new Utilizator();
        try {
            utilizNou.setareNume = campuriText.nume;
            utilizNou.setareUsername = campuriText.username;
            utilizNou.email = campuriText.email
            utilizNou.prenume = campuriText.prenume

            utilizNou.parola = campuriText.parola;
            utilizNou.culoare_chat = campuriText.culoare_chat;
            utilizNou.poza = poza;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function (u, parametru, eroareUser) {
                if (eroareUser == -1) {//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                } else {
                    eroare += "Mai exista username-ul";
                }

                if (!eroare) {
                    res.render("pagini/inregistrare", {raspuns: "Inregistrare cu succes!"})

                } else res.render("pagini/inregistrare", {err: "Eroare: " + eroare});
            })


        } catch (e) {
            console.log(e);
            eroare += "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", {err: "Eroare: " + eroare})
        }


    });
    formular.on("field", function (nume, val) {  // 1

        console.log(`--- ${nume}=${val}`);

        if (nume == "username") username = val;
    })
    formular.on("fileBegin", function (nume, fisier) { //2
        console.log("fileBegin");

        console.log(nume, fisier);
        //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser = path.join(__dirname, "poze_uploadate", username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser)) fs.mkdirSync(folderUser);
        fisier.filepath = path.join(folderUser, fisier.originalFilename)
        poza = fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })
    formular.on("file", function (nume, fisier) {//3
        console.log("file");
        console.log(nume, fisier);
    });
});


//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token", function (req, res) {
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username, {
            res: res, token: req.params.token
        }, function (u, obparam) {
            AccesBD.getInstanta().update({
                tabel: "utilizatori", campuri: {confirmat_mail: 'true'}, conditiiAnd: [`cod='${obparam.token}'`]
            }, function (err, rezUpdate) {
                if (err || rezUpdate.rowCount == 0) {
                    console.log("Cod:", err);
                    afisareEroare(res, 3);
                } else {
                    res.render("pagini/confirmare.ejs");
                }
            })
        })
    } catch (e) {
        console.log(e);
        renderError(res, 2);
    }
});

app.post("/profil", function (req, res) {
    console.log("profil");
    if (!req.session.utilizator) {
        randeazaEroare(res, 403,)
        res.render("pagini/eroare_generala", {text: "Nu sunteti logat."});
        return;
    }
    var formular = new formidable.IncomingForm();

    formular.parse(req, function (err, campuriText, campuriFile) {

        var parolaCriptata = Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },
        AccesBD.getInstanta().updateParametrizat({
            tabel: "utilizatori",
            campuri: ["nume", "prenume", "email", "culoare_chat"],
            valori: [`${campuriText.nume}`, `${campuriText.prenume}`, `${campuriText.email}`, `${campuriText.culoare_chat}`],
            conditiiAnd: [`parola='${parolaCriptata}'`, `username='${campuriText.username}'`] //??????
        }, function (err, rez) {
            if (err) {
                console.log(err);
                afisareEroare(res, 2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount === 0) {
                res.render("pagini/profil", {mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            } else {
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume = campuriText.nume;
                req.session.utilizator.prenume = campuriText.prenume;
                req.session.utilizator.email = campuriText.email;
                req.session.utilizator.culoare_chat = campuriText.culoare_chat;
                res.locals.utilizator = req.session.utilizator;
            }


            res.render("pagini/profil", {mesaj: "Update-ul s-a realizat cu succes."});

        });


    });
});

/******************Administrare utilizatori */
app.get("/useri", function (req, res) {

    if (req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)) {
        AccesBD.getInstanta().select({tabel: "utilizatori", campuri: ["*"]}, function (err, rezQuery) {
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows});
        });
    } else {
        afisareEroare(res, 403);
    }
});


app.post("/sterge_utiliz", function (req, res) {
    if (req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)) {
        var formular = new formidable.IncomingForm();

        formular.parse(req, function (err, campuriText, campuriFile) {

            AccesBD.getInstanta().delete({
                tabel: "utilizatori", conditiiAnd: [`id=${campuriText.id_utiliz}`]
            }, function (err, rezQuery) {
                console.log(err);
                res.redirect("/useri");
            });
        });
    } else {
        afisareEroare(res, 403);
    }
})

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.locals.utilizator = null;
    res.render("pagini/logout");
});


app.get("/*", function (req, res) {
    try {
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                console.log(err);
                if (err.message.startsWith("Failed to lookup view"))
                    // afisareEroare(res, {_identificator:404, _titlu:"ceva"});
                    afisareEroare(res, 404); else afisareEroare(res);
            } else {
                console.log(rezRandare);
                res.send(rezRandare);
            }
        });
    } catch (err) {
        if (err.message.startsWith("Cannot find module"))
            // afisareEroare(res, {_identificator:404, _titlu:"ceva"});
            afisareEroare(res, 404); else afisareEroare(res);
    }

});

function initErori() {
    var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);
    let vErori = obGlobal.obErori.info_erori;
    // for(let i = 0; i < vErori.length; i++)
    for (let eroare of vErori) {
        eroare.imagine = "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}

initErori();

function initImagini() {
    var continut = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = [];

    d = new Date("25 April 2023 12:00:00");

    for (let imag of obGlobal.obImagini.imagini) {
        if (imag.timp && (d.getHours() >= 5 && d.getHours() < 12 && imag.timp.includes("dimineata")) || (d.getHours() >= 12 && d.getHours() < 20 && imag.timp.includes("zi")) || ((d.getHours() >= 20 || d.getHours() < 5) && imag.timp.includes("noapte"))) {
            vImagini.push(imag);
        }
    }
    obGlobal.obImagini.imagini = vImagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    if (!fs.existsSync(caleAbsMediu)) fs.mkdirSync(caleAbsMediu);
    // for(let i = 0; i < vErori.length; i++)
    for (let img of vImagini) {
        [numeFis, ext] = img.cale_relativa.split(".");
        let caleFisAbs = path.join(caleAbs, img.cale_relativa);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        img.fisier_mediu = "/" + path.join(obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp");
        img.cale_relativa = "/" + path.join(obGlobal.obImagini.cale_galerie, img.cale_relativa);
        //eroare.imagine = "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}

initImagini();

// Daca programatorul seteaza titlul, se ia titlul din argument. Daca nu e setat, se ia cel din json. daca nu avem titlul si nici json se ia titlul de valoarea default
// function afisareEroare(res, {_identificator, _titlu, _text, _imagine} = {} ){
function afisareEroare(res, _identificator, _titlu = "titlu default", _text, _imagine) {
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (elem) {
        return elem.identificator === _identificator;
    })
    if (eroare) {
        let titlu1 = _titlu === "titlu default" ? (eroare.titlu || _titlu) : _titlu;
        let text1 = _text || eroare.text;
        let imagine1 = _imagine || eroare.imagine;
        if (eroare.status) res.status(eroare.identificator).render("pagini/eroare", {
            titlu: titlu1, text: text1, imagine: imagine1
        }); else res.render("pagini/eroare", {titlu: titlu1, text: text1, imagine: imagine1});
    } else {
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: errDef.titlu, text: errDef.text, imagine: obGlobal.obErori.cale_baza + "/" + errDef.imagine
        });
    }

}

app.listen(8080);
console.log("serverul a pornit");
