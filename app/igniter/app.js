
function PageLoader(){
  let Pageloader = document.getElementById('Pageloader');
  let cardPage = document.getElementById('CardPage');
  cardPage.style.display = 'none';
    setTimeout(() => {
      Pageloader.style.display = 'none';
      cardPage.style.display = 'block';
    }, 6000);
  };
  
  
  
  // Tag Element
    let tags = [];
    let orgId = "20097803016" || "20081917756";
    let fileName;
    const ul = document.querySelector("ul"),
      input = document.querySelector("input"),
      tagNumb = document.querySelector(".details span");
    
    
    /*
    Creation of Li function 
    */
    function createTag() {
      ul.querySelectorAll("li").forEach((li) => li.remove());
      tags
        .slice()
        .reverse()
        .forEach((tag) => {
          let liTag = `<li>${tag} <span class="close_tag" onclick="remove(this, '${tag}')"> ➖ </span></li>`;
          ul.insertAdjacentHTML("afterbegin", liTag);
        });
    }
    
    /*
    Remove Function
    */
    function remove(element, tag) {
      let index = tags.indexOf(tag);
      tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
      element.parentElement.remove();
    }
    
    /* remove list tag */
    const removeBtn = document.querySelector("#remove");
    removeBtn.addEventListener("click", () => {
      tags.length = 0;
      ul.querySelectorAll("li").forEach((li) => li.remove());
    });
  
   
      /* remove Reload */
     document.getElementById("reload").addEventListener("click", () => {
      location.reload(true);
      });
    
    /*error message */
    
    function showAlert(message){
    var alertDiv = document.getElementById('alertDiv');
    if (alertDiv.style.display === 'none') {
      alertDiv.style.display = 'block';  
    } 
    let errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = message;
      setTimeout(() => {
        alertDiv.style.display = 'none';
    
      }, 3000);
    };
    /*
    
    
    /* loader function */
    function Loader(resolve){
      if(resolve){
        var loader = document.getElementById('loader');
        if (loader.style.display === 'none') {
          loader.style.display = 'block';  
        } 
    
        setTimeout(() => {
          loader.style.display = 'none';
        },5000);
      }
      };
      /*
    
    
    
    
    Addtag Function
    */
    input.addEventListener("keyup", addTag);
    function addTag(e) {
      if (e.key === "Enter") {
        let tag = e.target.value.replace(/\s+/g, " ").trim();
        const numberPattern = /^\d+$/;
    
        if (tag.length > 1 && numberPattern.test(tag) && !tags.includes(tag)) {
          let inputTags = tag.split(",");
          if (tags.length + inputTags.length <= 5) {
            inputTags.forEach((tagPart) => {
              if (numberPattern.test(tagPart)) {
                tags.push(tagPart.trim());
                createTag();
              }
            });
          } else {
    
            textMessage ="You have reached the entry limit of 5 documents.❗";
            showAlert(textMessage)
          }
        } else {
          if (tags.includes(tag)) {
            textMessage = "This value has been added already.❗";
            showAlert(textMessage)
          } else {
            textMessage = "Invalid input. Please enter numerical values only.❗";
            showAlert(textMessage)
          }
        }
        e.target.value = "";
      }
    }
    
    /* API REQUEST */
    window.onload = function () {
      ZOHODESK.extension.onload().then(() => {
    
        createTag();
        PageLoader() 
        let ticketId;
        ZOHODESK.get("ticket")
          .then(function (response) {
            if(response){
              ticketId = response["ticket"].id;
              return;
            }
          })
          .catch(function (err) {
            console.log(err);
          });
  
       
        const sumbitRecord = document.querySelector("#submit");
        sumbitRecord.addEventListener("click", () => {
          if (tags != null && tags != "") {
            tags.forEach((tag) => {
              const baseUrl =
                "https://datevconnect.riecken-webservices.at/datev/api/dms/v2";
              let requestUrl = `${baseUrl}/documents`;
    
              let filter = `number eq ${tag}`;
              const request = {
                url: requestUrl,
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json;charset=utf-8",
                },
                postBody: {},
                type: "GET",
                data: {
                  filter: filter,
                },
                connectionLinkName: "datev_connection",
              };
    
              ZOHODESK.request(request).then((res) => {
                  if(!res){
                    return
                  }
                  Loader(res)
                    const documentResponse = JSON.parse(JSON.parse(JSON.parse(res).response).statusMessage).shift(); 
                    if(!documentResponse){
                      textMessage = "Document ID not found.❗";
                      showAlert(textMessage)
                      tags.length = 0;
                      ul.querySelectorAll("li").forEach((li) => li.remove());
                    }          
                    const documentID = documentResponse.id;
                  
     
                    let documentStructure = `${baseUrl}/documents/${documentID}/structure-items`;
    
                    const requestStructure = {
                      url: documentStructure,
                      headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json;charset=utf-8",
                      },
                      postBody: {},
                      type: "GET",
                      data: {},
                      connectionLinkName: "datev_connection",
                    };
    
                    ZOHODESK.request(requestStructure).then(
                      (res) => {
                        if (!res) {
                          console.log("something happend in server");
                        } else {
    
                          Loader(res)
                          let documentFileID = JSON.parse(JSON.parse(JSON.parse(res).response).statusMessage).shift().document_file_id;
                            console.log(documentFileID)
                            console.log(ticketId)
                          var triggerAttachment = {
                            url: "https://www.zohoapis.eu/crm/v2/functions/testemail/actions/execute",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            postBody: {},
                            type: 'POST',
                            data: {
                                "auth_type":"apikey",
                                "zapikey":"1003.eb88b4a772b1f4098656ebd6f6a1e895.10ba8555d32264469535fee12d98a084",
                                "documentId": documentFileID,
                                "ticketId":ticketId
                            }
                        }
                        ZOHODESK.request(triggerAttachment).then(res => {
    
                           let reponseAttchment =JSON.parse(res).response;
                           reponseAttchment = JSON.parse(reponseAttchment).code
                            if(reponseAttchment === "success"){
                              ZOHODESK.invoke("ROUTE_TO","ticket.attachments");
                              ZOHODESK.notify({
                                title: "DMS APP : File Attachment Success",
                                content: `This file ${tag} already attached to this ticket`,
                                icon: "success",
                                autoClose: true
                            });
  
  
                            ZOHODESK.invoke("HIDE");
                            }
                            
    
    
                        }, (error) => {
    
                            console.log(error);
                        })
      
    
                        }
                      },
                      (error) => {
                        console.log(error);
                      }
                    );
    
                },
                (error) => {
                  console.log(error);
                }
              );
            });
          } else {
            textMessage = "Don't submit empty values.❗";
            showAlert(textMessage)
          }
        });
      });
    };
  
  
  
  
  