//setCookie("a",10, 1000)
function setCookie(nume, val, timpExpirare){//timpExpirare in milisecunde
    d=new Date();
    d.setTime(d.getTime()+timpExpirare)
    document.cookie=`${nume}=${val}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(nume){
    vectorParametri=document.cookie.split(";") // ["a=10","b=ceva"]
    for(let param of vectorParametri){
        if (param.trim().startsWith(nume+"="))
            return param.split("=")[1];
    }
    return null;
}

function deleteCookie(nume){
    console.log(`${nume}; expires=${(new Date()).toUTCString()}`)
    document.cookie=`${nume}=0; expires=${(new Date()).toUTCString()}`;
}

function deleteAllCookies(){
    vectorParametri=document.cookie.split(";");
    for(let param of vectorParametri){
        console.log(param.trim().split("=")[0]);
        deleteCookie(param.trim().split("=")[0]);
    }
}


window.addEventListener("load", function(){
    ///Banner cookies
    if (getCookie("acceptat_banner")){
        document.getElementById("banner").style.display="none";
    }

    this.document.getElementById("ok_cookies").onclick=function(){
        setCookie("acceptat_banner",true,60000);
        document.getElementById("banner").style.display="none";
    }

    ///Ultimul produs
    if(getCookie("ultProdus") && window.location.href === "http://localhost:8080/profil"){
        if(document.getElementById("ultimulProdus"))
        {
            document.getElementById("ultimultProdus").remove();
        }
        let a = document.createElement("a");
        a.id = "ultimulProdus";
        a.href = '/produs/' + getCookie("ultProdus");
        a.innerHTML = 'Ultimul produs accesat';
        let ps = document.getElementById("containerUltProd");
        ps.appendChild(a);
    }

    var pattern = /\/produs\/.+$/
    if(pattern.test(window.location.href)){
        setCookie("ultProdus", window.location.href[window.location.href.length - 1], 6000000);
    }
})
