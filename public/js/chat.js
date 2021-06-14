const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')
const $sidebar=document.querySelector('#sidebar')

const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML


const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild

    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    
    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight

    const scrollOffset=$messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }


   console.log(newMessageMargin)

}


socket.on('message',(message)=>{
    console.log(message)  
    const html=Mustache.render(messageTemplate,
        {  
            username:message.username,
            message:message.text,
            createdAt:moment(message.createdAt).format('h:mm a')
        })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()  

})


socket.on('locationMessage',(url)=>{
    console.log(url)
    const html=Mustache.render(locationTemplate,{
        username:url.username,
        url:url.text,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML=html
    
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')


    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('The message was delivered!')
    })
})


$sendLocationButton.addEventListener('click',()=>{
    $sendLocationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(ack)=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log(ack)
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})