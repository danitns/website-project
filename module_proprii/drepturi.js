
/**
 @typedef Drepturi
 @type {Object}
 @property {Symbol} vizualizareUtilizatori Dreptul de a intra pe  pagina cu tabelul de utilizatori.
 @property {Symbol} stergereUtilizatori Dreptul de a sterge un utilizator
 @property {Symbol} cumparareProduse Dreptul de a cumpara

 @property {Symbol} vizualizareGrafice Dreptul de a vizualiza graficele de vanzari
 @property {Symbol} creareAnunturi Dreptul de a crea anunturi pe site
 @property {Symbol} editProfil Dreptul de a edita profilul unui utilizator
 @property {Symbol} editAnunturi Dreptul de a edita anunturile de pe site
 */


/**
 * @name module.exports.Drepturi
 * @type Drepturi
 */
const Drepturi = {
	vizualizareUtilizatori: Symbol("vizualizareUtilizatori"),
	stergereUtilizatori: Symbol("stergereUtilizatori"),
	cumparareProduse: Symbol("cumparareProduse"),
	vizualizareGrafice: Symbol("vizualizareGrafice"),
	creareAnunturi: Symbol("creareAnunturi"),
	editProfil: Symbol("editProfil"),
	editAnunturi: Symbol("editAnunturi")
}

module.exports=Drepturi;