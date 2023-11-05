import pass from "./pass.json" assert {type: "json"};
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import cards from "./cards.json" assert {type: "json"};


const supabase = createClient(pass.co, pass.anon);


const clientHeight = document.documentElement.clientHeight;


const view_whereFunc = document.querySelector(".view-whereFunc");
const view_whereFunc_video = document.querySelector(".view-whereFunc-video");


const view_card = document.querySelector(".view-card");
const view_communication = document.querySelector(".view-communication");
const view_ResizeImage = document.querySelector(".view-ResizeImage");


view_communication.style.cssText = `margin-top: ${clientHeight}px;`;


const communication_list = document.querySelector(".communication-list");

const communication_loader_bool = document.querySelector(".communication-loader-bool");
const communication_loader = document.querySelector(".communication-loader");


const cardItem = cards.map((card) =>
{
    return `
    <div class="card" style="background: #${card.color};">
        <div class="card-wrap">
            <div class="card-title">
                ${card.title}
            </div>
            <img class="card-img" src="${card.imagePath}" />
        </div>
    </div>
    `
}).join("");
view_card.innerHTML = cardItem;


const card = document.querySelectorAll(".card");

for (let i = 0; i < card.length; i++)
{
    const e_card = card[i];

    e_card.addEventListener("click", async (event) =>
    {
        const view_card = document.querySelector(".view-card");
        const view_communication = document.querySelector(".view-communication");

        const communication_header_label = document.querySelector(".communication-header-label");
        const communication_header_back = document.querySelector(".communication-header-back");
        const title = e_card.innerText;
        const color = e_card.style.background;
        const colorCode = e_card.attributes.style.value.match(/#[0-9A-Fa-f]{6}/)[0];

        view_card.classList.add("open-communication");
        view_communication.classList.add("open-communication");

        communication_header_label.innerHTML = title;
        communication_header_label.style.backgroundColor = color;

        communication_header_back.style.background = color;

        communication_loader.style.cssText = `border-top: 3px solid ${color}; border-left: 3px solid ${color};`;


        if (localStorage.getItem("view_whereFunc") == 1)
        {
            view_whereFunc.classList.add("hidden");
        } else {
            setTimeout(()=>
            {
                view_whereFunc.classList.add("visible");
                view_whereFunc_video.play();
            }, 50);

            setTimeout(()=>
            {
                view_whereFunc.classList.add("hiddenOne");
                localStorage.setItem("view_whereFunc", 1);
            }, 14000);
        }


        const dataDB = await supabase
            .from("main")
            .select()
            .eq("discipline", `${title}`);

        await supabase
            .channel("supabase_realtime")
            .on("postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "main",
                    filter: `discipline=in.(${title})`
                },
                (data) => {
                    const communication_cover = document.querySelectorAll(".communication-cover");

                    if (data.eventType == "INSERT")
                    {
                        communication_list.insertAdjacentHTML(
                            "beforeend",
                            `
                                <div id="${data.new.id}" class="communication-cover cover-new" style="background:${colorCode}94;">
                                    ${
                                        data.new.message
                                        ? `<span class="communication-message">${data.new.message}</span>`
                                        : `<img class="communication-image" src="${data.new.imageURL}">`
                                    }
                                </div>
                            `
                        );

                        const communication_image = document.querySelectorAll(".communication-image");

                        for (let i = 0; i < communication_image.length; i++)
                        {
                            const element = communication_image[i];
                    
                            element.onclick = ()=>
                            {
                                view_communication.classList.remove("open-communication");
                                view_communication.classList.add("full-communication");
                    
                                view_ResizeImage.classList.add("open-image");
                    
                                document.querySelector(".communication-list").classList.add("listMessageMargin");
                    
                                document.querySelector(".zoomist-image").attributes[1].textContent = element.attributes.src.textContent;
                            }
                        }
                    }
                    else if (data.eventType == "UPDATE")
                    {
                        for (let i = 0; i < communication_cover.length; i++)
                        {
                            const elem = communication_cover[i];

                            const updateMessageId = data.new.id;
                            const basicMessageId = elem.getAttribute("id");

                            if (parseInt(basicMessageId) === updateMessageId)
                            {
                                elem.children[1].innerHTML = data.new.message;
                            }
                            
                        }
                    }
                    else if (data.eventType == "DELETE")
                    {
                        for (let i = 0; i < communication_cover.length; i++)
                        {
                            const elem = communication_cover[i];
                            console.log(elem)

                            const updateMessageId = data.old.id;
                            const basicMessageId = elem.getAttribute("id");

                            if (parseInt(basicMessageId) === updateMessageId)
                            {
                                elem.remove();
                                break;
                            }
                            
                        }
                    }
                }
            )
            .subscribe();



        setTimeout(()=>
        {
            if (dataDB.data.length >= 1)
            {
                dataDB.data.sort((b, a) => b["id"] - a["id"]);
                dataDB.data.sort((b, a) => new Date(b["created_at"]) - new Date(a["created_at"]));

                let previousDate = null;

                communication_list.innerHTML = dataDB.data.map((data) =>
                {
                    communication_loader_bool.classList.add("hidden");

                    const created_at = data["created_at"];
                    const dateTime = new Date(created_at);
                    const formattedDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(dateTime);

                    return `
                        
                        <div id="${data.id}" class="communication-cover">
                            <span class="communication-date" style="${ formattedDate !== previousDate ? 'margin-bottom: 20px; margin-top: 8px;' : 'margin-bottom: 0 !important; margin-top: 0 !important;' }"">
                                ${formattedDate !== previousDate ? previousDate = formattedDate : ""}
                            </span>
                            ${
                                data.message
                                ? `<span class="communication-message">${data.message}</span>`
                                : `<img class="communication-image" src="${data.imageURL}">`
                            }
                        </div>
                    `;
                }).join("");
            } else {
                communication_loader_bool.classList.add("hidden");
            }

            const communication_image = document.querySelectorAll(".communication-image");

            for (let i = 0; i < communication_image.length; i++)
            {
                const element = communication_image[i];
            
                element.onclick = ()=>
                {
                    view_communication.classList.remove("open-communication");
                    view_communication.classList.add("full-communication");
            
                    view_ResizeImage.classList.add("open-image");
            
                    document.querySelector(".communication-list").classList.add("listMessageMargin");
            
                    document.querySelector(".zoomist-image").attributes[1].textContent = element.attributes.src.textContent;
                }
            }
        }, 300);

    });
}


const communication_header_back = document.querySelector(".communication-header-back");

const rezise_image_back = document.querySelector(".rezise-image-back > svg");


communication_header_back.onclick = ()=>
{
    view_card.classList.remove("open-communication");
    view_communication.classList.remove("open-communication");

    setTimeout(()=>
    {
        communication_list.innerHTML = "";
        communication_loader_bool.classList.remove("hidden");
    }, 50);
};


const zoom_image = new Zoomist("#zoomist",
{
    fill: "cover",
    maxRatio: 4,
    height: '30%',
    zoomer: true,
    bounds: false,
});

rezise_image_back.onclick = ()=>
{
    view_communication.classList.add("open-communication");
    view_communication.classList.remove("full-communication");

    view_ResizeImage.classList.remove("open-image");

    communication_list.classList.remove("listMessageMargin");

    document.querySelector(".zoomist-zoomer").remove();
    
    setTimeout(()=> { zoom_image.update(); zoom_image.reset(); }, 200);
};