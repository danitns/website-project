
let tema = localStorage.getItem("tema");

if(tema === "dark") {
    document.body.classList.add("dark");
}
else if(tema === "purple") {
    document.body.classList.add("purple");
}

window.addEventListener("DOMContentLoaded", function() {

    if(tema === "dark") {
        let radiobtn = document.getElementsByName("tema");
        for(let r of radiobtn){
            if(r.value === "dark") {
                r.checked = true;
                break;
            }

        }
    }

    else if(tema === "purple") {
        let radiobtn = document.getElementsByName("tema");
        for(let r of radiobtn){
            if(r.value === "purple") {
                r.checked = true;
                break;
            }

        }
    }

    let radioButtons = document.getElementsByName("tema");

    for (let r of radioButtons) {
        r.addEventListener("click", function () {
            if (this.checked) {
                if (this.value === "light") {
                    if (document.body.classList.contains("dark"))
                        document.body.classList.remove("dark");
                    else if (document.body.classList.contains("purple"))
                        document.body.classList.remove("purple");
                    localStorage.removeItem("tema");
                } else if (this.value === "dark") {
                    if (document.body.classList.contains("purple"))
                        document.body.classList.remove("purple");
                    localStorage.setItem("tema", "dark");
                    document.body.classList.add("dark");
                } else if (this.value === "purple") {
                    if (document.body.classList.contains("dark"))
                        document.body.classList.remove("dark");
                    localStorage.setItem("tema", "purple");
                    document.body.classList.add("purple");
                }
            }
        });
    }


    // document.getElementById("tema").onclick = function() {
    //     if(document.body.classList.contains("dark")) {
    //         document.body.classList.remove("dark");
    //         localStorage.removeItem("tema");
    //     }
    //     else {
    //         document.body.classList.add("dark");
    //         localStorage.setItem("tema", "dark");
    //     }
    // }
});