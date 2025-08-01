import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import LandingPage from "@/app/(nondashboard)/landing/page";

export default function Home() {
  return (
    <div className='h-full w-full'>
      <Navbar/>
      <main 
        className="h-full flex w-full flex-col"
       
      >
        <LandingPage/>
      </main> 
      
    </div>
  );
}
