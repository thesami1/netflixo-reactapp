// import React from "react";
// import MainModal from "./MainModal";
// import { Input } from "../UsedInputs";
// import Uploder from "../Uploder";

// function CastsModal({ modalOpen, setModalOpen, cast }) {
//   return (
//     <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
//       <div className="inline-block sm:w-4/5 border border-border md:w-3/5 lg:w-2/5 w-full align-middle p-10 overflow-y-auto h-full bg-main text-white rounded-2xl">
//         <h2 className="text-3xl font-bold">
//           {cast ? "Update Cast" : "Create Cast"}
//         </h2>
//         <form className="flex flex-col gap-6 text-left mt-6">
//           <Input
//             label="Cast Name"
//             placeholder={cast ? cast.fullName : "John Doe"}
//             type="text"
//             bg={false}
//           />
//           <div className="flex flex-col gap-2">
//             <p className="text-border font-semibold text-sm">Cast Image</p>
//             <Uploder />
//             <div className="w-32 h-32 p-2 bg-main border border-border rounded">
//               <img
//                 src={`/images/${cast ? cast.image : "user.png"}`}
//                 alt={cast?.fullName}
//                 className="w-full h-full object-cover rounded"
//               />
//             </div>
//           </div>
//           <button
//             onClick={() => setModalOpen(false)}
//             className="w-full flex-rows gap-4 py-3 text-lg transitions hover:bg-dry border-2 border-subMain rounded bg-subMain text-white"
//           >
//             {cast ? "Update" : "Add"}
//           </button>
//         </form>
//       </div>
//     </MainModal>
//   );
// }

// export default CastsModal;


import React, { useEffect, useState } from "react";
import MainModal from "./MainModal";
import { Input } from "../UsedInputs";
import Uploder from "../Uploder";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  addCastAction,
  updateCastAction,
} from "../../Redux/Actions/MoviesActions";
import { InlineError } from "../Notifications/Error";
import { Imagepreview } from "../Imagepreview";

function CastsModal({ modalOpen, setModalOpen, cast }) {
  const dispatch = useDispatch();
  const [castImage, setCastImage] = useState("");
  const generateId = Math.floor(Math.random() * 100000000);
  const image = castImage ? castImage : cast?.image;

  // validate cast
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required("Cast Name is required"),
      })
    ),
  });

  // on submit
  const onSubmit = (data) => {
    if (cast) {
      // if cast is not null then update cast
      dispatch(
        updateCastAction({
          ...data,
          image: image,
          id: cast.id,
        })
      );
      toast.success("Cast updated successfully");
    } else {
      // else create cast
      dispatch(
        addCastAction({
          ...data,
          image: image,
          id: generateId,
        })
      );
      toast.success("Cast created successfully");
    }
    reset();
    setCastImage("");
    setModalOpen(false);
  };

  useEffect(() => {
    if (cast) {
      setValue("name", cast?.name);
    }
  }, [cast, setValue]);

  return (
    <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
      <div className="inline-block sm:w-4/5 border border-border md:w-3/5 lg:w-2/5 w-full align-middle p-10 overflow-y-auto h-full bg-main text-white rounded-2xl">
        <h2 className="text-3xl font-bold">
          {cast ? "Update Cast" : "Create Cast"}
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 text-left mt-6"
        >
          <div className="w-full">
            <Input
              label="Cast name"
              placeholder="John Doe"
              type="text"
              name="name"
              register={register("name")}
              bg={true}
            />
            {errors.name && <InlineError text={errors.name.message} />}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-border font-semibold text-sm">Cast Image</p>
            <Uploder setImageUrl={setCastImage} />
            <Imagepreview
              image={image ? image : "/images/user.png"}
              name="castImage"
            />
          </div>
          <button
            type="submit"
            onClick={() => setModalOpen(false)}
            className="w-full flex-rows gap-4 py-3 text-lg transitions hover:bg-dry border-2 border-subMain rounded bg-subMain text-white"
          >
            {cast ? "Update" : "Add"}
          </button>
        </form>
      </div>
    </MainModal>
  );
}

export default CastsModal;
