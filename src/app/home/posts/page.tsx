import prisma from "../../../db/prisma";
import axios from "axios";

// add a db url in prisma
// no agent needed here
const userNews = async () => {
  // const response = await prisma.news.findMany();
  // return response.map((e: any) => ({
  //   id : e.id,
  //   title : e.title,
  //   description : e.description,
  //   price : e.mint_price
  // }))
};

export default async function UserPostedNews() {
  //fetch news from db here
  const news = await userNews();

  return (
    <div>
      User Posted news here
      {/* <ul className="grid grid-cols-2">
         {news.map((t : any, index : any) => (
             <li key={index} >
                <div className="m-5 text-2xl bg-violet-500 p-7 rounded-2xl text-white">
                <strong>Heading:</strong> {t.title} <br />
                <strong>Description:</strong> {t.description} <br />
                </div>
           </li>
         ))
         }
       </ul> */}
    </div>
  );
}
