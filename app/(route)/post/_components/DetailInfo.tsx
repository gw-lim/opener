import classNames from "classnames";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import ProgressBar from "@/components/ProgressBar";
import InputFile from "@/components/input/InputFile";
import { PostType } from "../page";
import FunnelTitle from "./FunnelTitle";
import PostFooter from "./PostFooter";

const DetailInfo = () => {
  const { getValues, setValue, control } = useFormContext<PostType>();
  const [isCheck, setIsCheck] = useState(false);
  const [imgList, setImgList] = useState<File[]>(getValues("images"));

  useEffect(() => {
    setValue("images", imgList);
  }, [imgList]);

  return (
    <div className="flex flex-col gap-24">
      <ProgressBar ratio="full" />
      <FunnelTitle step="상세 설명" />
      <main>
        <div>
          <div>이미지</div>
          <div className="flex gap-8">
            <InputFile name="images" setState={setImgList} />
            <div className="scrollbar-hide flex w-[400px] gap-8 overflow-x-scroll">
              {imgList.map((file, idx) => (
                <div key={idx} className="relative flex h-120 w-120 shrink-0">
                  <div className="absolute right-0 top-0 z-popup cursor-pointer" onClick={() => setImgList((prev) => prev.filter((item: File) => item !== file))}>
                    삭제
                  </div>
                  <Image src={URL.createObjectURL(file)} alt="선택한 사진 미리보기" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div>첫번째 이미지 썸네일 등록</div>
        </div>
        <label className="flex flex-col">
          상세 내용
          <Controller
            control={control}
            name="detailText"
            render={({ field: { onChange, onBlur, value } }) => (
              <textarea id="detail_text" className="h-120 border-2" placeholder="이벤트를 설명하세요." onChange={onChange} onBlur={onBlur} value={value} />
            )}
          />
        </label>
        <div className=" bg-slate-400">이용약관 어쩌구 저쩌구..</div>
        {isCheck ? <div onClick={() => setIsCheck(false)}>체크됨</div> : <div onClick={() => setIsCheck(true)}>체크안함</div>}
      </main>
      <PostFooter />
    </div>
  );
};

export default DetailInfo;
