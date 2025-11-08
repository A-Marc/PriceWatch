
import logo from '../assets/logo.jpg'; 
import addcartlogo from '../assets/addcartlogo.jpg';


function Navbar({onAddProductClick}) {
  
    return(
        <div className="bg-white flex  flex-col  p-4 md:flex-row justify-between ">
         <div className='flex gap-2'> 
           <img 
                src={logo} 
                alt="PriceWatch Logo" 
                className="h-7 w-7"
            />
            <h1 className="text-black font-bold text-xl">PriceWatch Tracker</h1>
         </div>
          
            <button onClick={onAddProductClick}  className=" flex justify-center bg-blue-500 p-4 m-4 text-white font-semibold py-1 px-3 rounded md:m-0 ">
               
                Track New Product 
                  <img src={addcartlogo}   className="h-7 w-15" alt="cartlogo" />
            </button>
           
        </div>
    );
}

export default Navbar;