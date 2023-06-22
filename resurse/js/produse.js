window.addEventListener("load", function () {

    var eraseButtons=document.getElementsByClassName("erase");
    for(let button of eraseButtons) {
        button.onclick = function () {

            var produse = document.getElementsByClassName("produs");
            for (let prod of produse) {

                let idProdus=prod.getElementsByClassName("val-id")[0].innerHTML;

                let eraseButton = document.getElementById("erase" + idProdus);

                eraseButton.onclick = function () {
                    prod.style.display = "none";
                }
            }
        }
    }


    var stayButtons=document.getElementsByClassName("stay");
    for(let button of stayButtons) {
        button.onclick = function () {

            var produse = document.getElementsByClassName("produs");
            for (let prod of produse) {

                let idProdus=prod.getElementsByClassName("val-id")[0].innerHTML;

                let stayButton = document.getElementById("stay" + idProdus);

                stayButton.onclick = function () {
                    stayButton.classList.toggle("pressed");
                    prod.classList.toggle("alwaysShow");
                }

            }
        }
    }

    var delButtons=document.getElementsByClassName("delete_session");
    for(let button of delButtons) {
        button.onclick = function () {

            var produse = document.getElementsByClassName("produs");
            for (let prod of produse) {

                let idProdus=prod.getElementsByClassName("val-id")[0].innerHTML;

                let delButton = document.getElementById("del" + idProdus);

                delButton.onclick = function () {
                    sessionStorage.setItem('productDeleted'+idProdus, 'true');
                    prod.style.display="none";
                }

            }
        }
    }


    let iduriProduse=localStorage.getItem("cos_virtual");
    iduriProduse=iduriProduse?iduriProduse.split(","):[];      //["3","1","10","4","2"]

    for(let idp of iduriProduse){
        let ch = document.querySelector(`[value='${idp}'].select-cos`);
        if(ch){
            ch.checked=true;
        }
        else{
            console.log("id cos virtual inexistent:", idp);
        }
    }

    //----------- adaugare date in cosul virtual (din localStorage)
    let checkboxuri= document.getElementsByClassName("select-cos");
    for(let ch of checkboxuri){
        ch.onchange=function(){
            let iduriProduse=localStorage.getItem("cos_virtual");
            iduriProduse=iduriProduse?iduriProduse.split(","):[];

            if( this.checked){
                iduriProduse.push(this.value)
            }
            else{
                let poz= iduriProduse.indexOf(this.value);
                if(poz != -1){
                    iduriProduse.splice(poz,1);
                }
            }

            localStorage.setItem("cos_virtual", iduriProduse.join(","))
        }

    }

    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    document.getElementById("resetare").onclick= function(){

        if(confirm("Sigur vrei sa resetezi?")){
            document.getElementById("inp-nume").value="";

            document.getElementById("inp-noutati").checked = false;

            document.getElementById("inp-caroserie").value = "";

            document.getElementById("inp-descriere").value = "";

            document.getElementById("inp-transmisie").value = "Transmisie";

            document.getElementById("inp-pret").value=document.getElementById("inp-pret").min;
            document.getElementById("inp-combustibil").value="Toate";
            document.getElementById("i_rad4").checked=true;
            var produse=document.getElementsByClassName("produs");
            document.getElementById("infoRange").innerHTML = "{0}";
            for (let prod of produse){
                let idProdus=prod.getElementsByClassName("val-id")[0].innerHTML;
                let isProductDeleted = sessionStorage.getItem('productDeleted'+idProdus) === 'true';
                if(!isProductDeleted)
                    prod.style.display="block";
            }
        }
    }

    var produse = document.getElementsByClassName("produs");
    var produse_filtrate = produse;

    var prod_per_page = 4;
    var nr_pag = Math.ceil(produse_filtrate.length / prod_per_page);

    let pagina_curenta = 0;
    function produsePagina() {
        nr_pag = Math.ceil(produse_filtrate.length / prod_per_page)
        for(let i = 0; i < produse_filtrate.length; i++) {
            let idProdus = produse_filtrate[i].getElementsByClassName("val-id")[0].innerHTML;

            var isProductDeleted = sessionStorage.getItem('productDeleted'+idProdus) === 'true';

            if(Math.floor(i / prod_per_page) === pagina_curenta && !isProductDeleted)
                produse_filtrate[i].style.display = "block";
            else produse_filtrate[i].style.display = "none";
        }
    }

    produsePagina();

    document.getElementById("next").onclick = function() {
        if(pagina_curenta < nr_pag) {
            pagina_curenta++;
            produsePagina();
        }
    }

    document.getElementById("previous").onclick = function() {
        if(pagina_curenta > 0) {
            pagina_curenta--;
            produsePagina();
        }
    }

    let textarea = document.getElementById("inp-nume");

    function validateTextarea(value) {
        var regex = /^[a-zA-Z]+$/;
        return regex.test(value);
    }

    textarea.addEventListener('input', function() {
        // Validează inputul din <textarea>
        var isValid = validateTextarea(this.value);

        // Setează proprietatea 'isInvalid' a elementului <textarea> în funcție de validare
        this.isInvalid = !isValid;

        // Aplică o clasă CSS pentru a evidenția că inputul este invalid
        if (!isValid) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });



    document.getElementById("filtrare").onclick = function () {
        let val_nume = document.getElementById("inp-nume").value.toLowerCase();

        let val_descriere = document.getElementById("inp-descriere").value.toLowerCase();

        let val_noutati = document.getElementById("inp-noutati").checked;

        let val_caroserie = document.getElementById("inp-caroserie").value.toLowerCase();

        let val_transmisie = document.getElementById("inp-transmisie").value;

        let radiobuttons = document.getElementsByName("gr_rad");

        let val_km;
        for(let r of radiobuttons) {
            if(r.checked) {
                val_km = r.value;
                break;
            }
        }

        if(val_km !== "Toate") {
            var km_a, km_b;
            [km_a, km_b] = val_km.split(":");
            km_a = parseInt(km_a);
            km_b = parseInt(km_b);
            console.log(km_a, km_b);

        }

        let val_pret = document.getElementById("inp-pret").value;

        let val_combustibil_selectat = document.getElementById("inp-combustibil").selectedOptions;
        let val_combustibil = "";
        for(let i = 0; i < val_combustibil_selectat.length; i++){
            val_combustibil += val_combustibil_selectat[i].value;
        }

        produse_filtrate = [];
        for(let prod of produse) {
            prod.style.display = "none";
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
            let cond1 = (nume.startsWith(val_nume) || nume.includes(val_nume));

            let km = parseInt(prod.getElementsByClassName("val-km")[0].innerHTML);
            let cond2 = val_km === "Toate" || (km_a <= km && km < km_b);

            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
            let cond3 = (pret > val_pret);

            let combustibil = prod.getElementsByClassName("val-combustibil")[0].innerHTML;
            let cond4 = val_combustibil.includes("Toate") || val_combustibil.includes(combustibil);

            let descriere = prod.getElementsByClassName("val-descriere")[0].innerHTML.toLowerCase();
            let cond5 = descriere.includes(val_descriere);

            let cond6 = true;
            if(val_noutati) {
                let [zi_sapt, zi, luna, an] = prod.getElementsByClassName("val-data")[0].innerHTML.split(" ");
                var month = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
                let d = new Date();
                cond6 = ((month.indexOf(luna) === d.getMonth()) || (month.indexOf(luna) === d.getMonth() - 1 && parseInt(zi) >= d.getDate()));
            }

            let caroserie = prod.getElementsByClassName("val-caroserie")[0].innerHTML.toLowerCase();
            let cond7 = val_caroserie === "" || val_caroserie === caroserie;

            let transmisie = prod.getElementsByClassName("val-transmisie")[0].innerHTML;
            let cond8 = val_transmisie === "Transmisie" || val_transmisie === transmisie;

            var idProdus=prod.getElementsByClassName("val-id")[0].innerHTML;
            var isProductDeleted = sessionStorage.getItem('productDeleted'+idProdus) === 'true';

            //if(cond8){
            let alwaysShow=prod.classList.contains("alwaysShow");
            if(((cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8) || alwaysShow) && !isProductDeleted){
                produse_filtrate.push(prod);
                //prod.style.display="block";
            }

            // if(cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8) {
            //     produse_filtrate.push(prod);
            //     //document.getElementById('mesaj-filtre').style.display="none";
            //     //prod.style.display="block";
            // }
        }

        produsePagina();

        if(produse_filtrate.length === 0)
            document.getElementById('mesaj-filtre').style.display="block";
    }

    function sortare(semn) {
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);
        v_produse.sort(function (a,b) {
            let pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            let pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret_a === pret_b) {
                let an_a = parseFloat(a.getElementsByClassName("val-an")[0].innerHTML);
                let an_b = parseFloat(b.getElementsByClassName("val-an")[0].innerHTML);
                return an_a - an_b;
            }
            return semn * (pret_a - pret_b);
        });

        for(let prod of v_produse) {
            prod.parentElement.appendChild(prod);
        }
    }

    document.getElementById("sortCrescAn").onclick = function () {
        sortare(1);
    }

    document.getElementById("sortDescrescAn").onclick = function () {
        sortare(-1);
    }

    document.getElementById("p-suma").onclick = function (){
        let ps;
        let container;
        let frate;

        if (document.getElementById("info-suma"))
            return;
        var produse = document.getElementsByClassName("produs");
        let suma = 0;
        for (let prod of produse) {
            if (prod.style.display !== "none") {
                let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                suma += pret;
            }
        }
        let p = document.createElement("p");
        p.innerHTML = suma;
        p.id = "info-suma";
        ps = document.getElementById("p-suma");
        container = ps.parentNode;
        frate = ps.nextElementSibling;
        container.insertBefore(p, frate);
        setTimeout(function () {
            let info = document.getElementById("info-suma");
            if (info)
                info.remove();
        }, 1000);

    }

    // window.onkeydown = function(e) {
    //     let ps;
    //     let container;
    //     let frate;
    //     if (e.key === "c" && e.altKey) {
    //         if (document.getElementById("info-suma"))
    //             return;
    //         var produse = document.getElementsByClassName("produs");
    //         let suma = 0;
    //         for (let prod of produse) {
    //             if (prod.style.display !== "none") {
    //                 let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
    //                 suma += pret;
    //             }
    //         }
    //         let p = document.createElement("p");
    //         p.innerHTML = suma;
    //         p.id = "info-suma";
    //         ps = document.getElementById("p-suma");
    //         container = ps.parentNode;
    //         frate = ps.nextElementSibling;
    //         container.insertBefore(p, frate);
    //         setTimeout(function () {
    //             let info = document.getElementById("info-suma");
    //             if (info)
    //                 info.remove();
    //         }, 1000);
    //     }
    // }

});