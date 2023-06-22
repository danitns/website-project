const AccesBD=require('./accesbd.js');

class Car{
    static tipConexiune = "local";
    static tabel = "cars";
    #eroare;

    constructor({id, poza, caroserie, marca, model, generatie, an, km, combustibil, capacitate, cp, transmisie, dotari, descriere, pret, negociabil, locatie} = {}) {
        this.id = id;
        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }
        this.#eroare = "";
    }

    saveCar() {
        AccesBD.getInstanta(Car.tipConexiune).insert({
            tabel: Car.tabel,
            campuri: {
                poza: this.poza,
                caroserie: this.caroserie,
                marca: this.marca,
                model: this.model,
                generatie: this.generatie,
                an: this.an,
                km: this.km,
                combustibil: this.combustibil,
                capacitate_cilindrica: this.capacitate,
                cp: this.cp,
                transmisie: this.transmisie,
                dotari: `{${this.dotari.split(',')}}`,
                descriere: this.descriere,
                pret: this.pret,
                negociabil: this.negociabil,
                locatie: this.locatie
            }
        }, function (err, rez) {
            if(err)
                console.log(err);
        });
    }
}

module.exports={Car:Car}