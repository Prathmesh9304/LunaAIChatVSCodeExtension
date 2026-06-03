import {
MessageSquare,
Settings
} from "lucide-react";

interface Props{

activePage:string;
setActivePage:(page:unknown)=>void;

}

function Sidebar({

activePage,
setActivePage

}:Props){

return(

<div className="w-[60px] border-r border-panel-border flex flex-col items-center py-4 gap-4">

<button
onClick={()=>setActivePage("chat")}
className={`p-3 rounded-lg ${
activePage==="chat"
?
"bg-primary"
:
"hover:bg-input-bg"
}`}
>

<MessageSquare size={18}/>

</button>

<button
onClick={()=>setActivePage("settings")}
className={`p-3 rounded-lg ${
activePage==="settings"
?
"bg-primary"
:
"hover:bg-input-bg"
}`}
>

<Settings size={18}/>

</button>

</div>

)

}

export default Sidebar;