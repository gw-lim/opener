"use client";

import classNames from "classnames";
import { useEffect, useState } from "react";
import "react-day-picker/dist/style.css";
import { useForm, useFormContext } from "react-hook-form";
import ProgressBar from "@/components/ProgressBar";
import InputText from "@/components/input/InputText";
import AddressModal from "@/components/modal/AddressModal";
import CalendarModal from "@/components/modal/CalendarModal";
import { useModal } from "@/hooks/useModal";
import { PostType } from "../page";
import FunnelTitle from "./FunnelTitle";
import PostFooter from "./PostFooter";

interface Props {
  onNextStep: () => void;
}

const MainInfo = ({ onNextStep }: Props) => {
  const {
    setValue,
    watch,
    formState: { isValid },
  } = useFormContext<PostType>();
  const { modal, openModal, closeModal } = useModal();

  const { title, address, startDate, endDate } = watch();
  const isDisabled = !title || !address || !startDate || !endDate || !isValid;

  return (
    <div className="flex flex-col gap-24">
      <ProgressBar ratio="1/2" />
      <FunnelTitle step="행사 정보" />
      <main>
        <InputText name="title" placeholder="카페 이름" rules={{ required: "제목을 입력해주세요." }}>
          제목
        </InputText>
        <InputText name="address" placeholder="도로명주소 검색" readOnly onClick={() => openModal("address")}>
          주소
        </InputText>
        <InputText name="detailAddress" placeholder="상세주소 입력" />
        <InputText name="startDate" placeholder="날짜 선택" readOnly onClick={() => openModal("date")}>
          기간
        </InputText>
        <InputText name="endDate" placeholder="날짜 선택" readOnly onClick={() => openModal("date")} />
      </main>
      <PostFooter onNextStep={onNextStep} isDisabled={isDisabled} />
      {modal === "address" && <AddressModal setValue={setValue} closeModal={closeModal} />}
      {modal === "date" && <CalendarModal setValue={setValue} closeModal={closeModal} />}
    </div>
  );
};

export default MainInfo;
