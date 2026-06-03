interface Props{

text:string;
sender:"user"|"bot";

}

function MessageBubble({

text,
sender

}:Props){

return(

<div
className={
sender==="user"
?
"flex justify-end"
:
"flex justify-start"
}
>

<div
className={`
px-4
py-3
rounded-xl
max-w-[80%]

${
sender==="user"
?
"bg-primary"
:
"bg-input-bg"
}

`}
>

{text}

</div>

</div>

)

}

export default MessageBubble;