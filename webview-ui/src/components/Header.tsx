interface Props{
title:string;
}

function Header({title}:Props){

return(

<header
className="
px-5
py-4
border-b
border-panel-border
"
>

<h1 className="text-2xl font-bold">

{title}

</h1>

</header>

)

}

export default Header;