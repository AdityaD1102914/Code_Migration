import { ChevronLeft } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom";

const Backbutton = () => {
     const navigate = useNavigate();
     const location = useLocation();
  const handleClick = () => {
    navigate(-1);
  };

  return (
    <button onClick={handleClick} className={`back-button absolute px-5 pt-2 ${location?.pathname == "/"?"hidden":""}`}>
      <ChevronLeft className="w-6 h-6 cursor-pointer hover:scale-105"/> 
    </button>
  )
}

export default Backbutton