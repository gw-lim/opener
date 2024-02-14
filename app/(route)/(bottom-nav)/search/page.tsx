"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { ButtonHTMLAttributes, ReactNode, useEffect, useRef, useState } from "react";
import BigRegionBottomSheet from "@/components/bottom-sheet/BigRegionBottomSheet";
import CalenderBottomSheet from "@/components/bottom-sheet/CalendarBottomSheet";
import GiftBottomSheet from "@/components/bottom-sheet/GiftsBottomSheet";
import SmallRegionBottomSheet from "@/components/bottom-sheet/SmallRegionBottomSheet";
import HorizontalEventCard from "@/components/card/HorizontalEventCard";
import SearchInput from "@/components/input/SearchInput";
import { Api } from "@/api/api";
import { useBottomSheet } from "@/hooks/useBottomSheet";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { formatDate } from "@/utils/formatString";
import { createQueryString } from "@/utils/handleQueryString";
import { Res_Get_Type } from "@/types/getResType";
import { GiftType } from "@/types/index";
import { TAG } from "@/constants/data";
import { BIG_REGIONS } from "@/constants/regions";
import DownArrowIcon from "@/public/icon/arrow-down_sm.svg";
import ResetIcon from "@/public/icon/reset.svg";
import SortIcon from "@/public/icon/sort.svg";

interface FilterType {
  bigRegion: (typeof BIG_REGIONS)[number] | "";
  smallRegion: string;
  startDate: string | null;
  endDate: string | null;
  gifts: GiftType[];
}

const BOTTOM_SHEET = {
  bigRegion: "big-region_bottom-sheet",
  smallRegion: "small-region_bottom-sheet",
  calender: "calender_bottom-sheet",
  gift: "gift_bottom-sheet",
};

const SORT = ["최신순", "인기순"] as const;

const SIZE = 20;

const SearchPage = () => {
  const { bottomSheet, openBottomSheet, closeBottomSheet, refs } = useBottomSheet();

  const searchParams = useSearchParams();
  const { initialKeyword, initialSort, initialBigRegion, initialSmallRegion, initialStartDate, initialEndDate, initialGifts } = getInitialQuery(searchParams);

  const [keyword, setKeyword] = useState(initialKeyword);
  const [sort, setSort] = useState<(typeof SORT)[number]>(initialSort);
  const [filter, setFilter] = useState<FilterType>({
    bigRegion: initialBigRegion,
    smallRegion: initialSmallRegion,
    startDate: initialStartDate,
    endDate: initialEndDate,
    gifts: initialGifts,
  });

  const setBigRegionFilter = (bigRegion: (typeof BIG_REGIONS)[number] | "") => {
    if (bigRegion === "") {
      setFilter((prev) => ({ ...prev, bigRegion }));
      setFilter((prev) => ({ ...prev, smallRegion: "" }));
      return;
    }
    setFilter((prev) => ({ ...prev, bigRegion }));
    setFilter((prev) => ({ ...prev, smallRegion: "전지역" }));
  };
  const setSmallRegionFilter = (smallRegion: string) => {
    setFilter((prev) => ({ ...prev, smallRegion }));
  };
  const setStartDateFilter = (startDate: string) => {
    setFilter((prev) => ({ ...prev, startDate }));
  };
  const setEndDateFilter = (endDate: string) => {
    setFilter((prev) => ({ ...prev, endDate }));
  };
  const setGiftsFilter = (gift: GiftType) => {
    if (filter.gifts.includes(gift)) {
      setFilter((prev) => {
        const newGift = prev.gifts.filter((currGift) => currGift !== gift);
        return { ...prev, gifts: newGift };
      });
    } else {
      setFilter((prev) => ({ ...prev, gifts: [...prev.gifts, gift] }));
    }
  };

  const resetFilter = () => {
    setKeyword("");
    setSort("최신순");
    setFilter({ bigRegion: "", smallRegion: "", startDate: null, endDate: null, gifts: [] });
  };

  const formatGift = (gifts: string[]) => {
    if (gifts.length === 0) {
      return;
    }
    if (gifts.length === 1) {
      return gifts[0];
    }
    return gifts[0] + "...";
  };

  const formattedDate = formatDate(filter.startDate, filter.endDate);
  const formattedGift = formatGift(filter.gifts);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const newQuery = createQueryString({ keyword, sort, ...filter }, searchParams);
    router.push(pathname + "?" + newQuery);
  }, [keyword, sort, filter]);

  const instance = new Api();
  const queryClient = useQueryClient();

  const getEvents = async ({ pageParam = 1 }) => {
    const data: Res_Get_Type["eventSearch"] = await instance.get("/event", {
      size: SIZE,
      page: pageParam,
      sort,
      keyword,
      sido: filter.bigRegion,
      gungu: filter.smallRegion === "전지역" ? "" : filter.smallRegion,
      ...(filter.startDate && { startDate: filter.startDate }),
      ...(filter.endDate && { endDate: filter.endDate }),
      tags: filter.gifts.map((gift) => TAG[gift]).join(","),
    });
    return data;
  };

  const {
    data: events,
    fetchNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["search"],
    queryFn: getEvents,
    getNextPageParam: (lastPage) => (lastPage.page * SIZE < lastPage.totalCount ? lastPage.page + 1 : null),
  });

  const containerRef = useInfiniteScroll({
    handleScroll: fetchNextPage,
    deps: [events],
  });

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["search"] });
    refetch();
  }, [searchParams]);

  return (
    <>
      <main className="w-full px-20 pb-84 pt-40">
        <SearchInput setKeyword={setKeyword} initialKeyword={initialKeyword} placeholder="최애의 행사를 찾아보세요!" />
        <section className="flex flex-col gap-20 pt-8 text-14 text-gray-500">
          <div className="flex gap-4">
            <FilterButton onClick={() => openBottomSheet(BOTTOM_SHEET.bigRegion)} selected={Boolean(filter.bigRegion)}>
              {filter.bigRegion || "시/도"}
            </FilterButton>
            {filter.bigRegion && (
              <FilterButton onClick={() => openBottomSheet(BOTTOM_SHEET.smallRegion)} selected={Boolean(filter.smallRegion)}>
                {filter.smallRegion}
              </FilterButton>
            )}
            <FilterButton onClick={() => openBottomSheet(BOTTOM_SHEET.calender)} selected={Boolean(filter.startDate)}>
              {formattedDate ?? "기간"}
            </FilterButton>
            <FilterButton onClick={() => openBottomSheet(BOTTOM_SHEET.gift)} selected={Boolean(filter.gifts.length)}>
              {formattedGift ?? "특전"}
            </FilterButton>
          </div>
          <div className="flex items-center gap-8">
            <SortIcon />
            <SortButton onClick={() => setSort("최신순")} selected={sort === "최신순"}>
              최신순
            </SortButton>
            <SortButton onClick={() => setSort("인기순")} selected={sort === "인기순"}>
              인기순
            </SortButton>
            <button onClick={resetFilter} type="button" className="ml-auto">
              <ResetIcon />
            </button>
          </div>
        </section>
        <section className="flex flex-col items-center">
          {events?.pages.map((page) => page.eventList.map((event) => <HorizontalEventCard key={event.id} data={event} />))}
          <div ref={containerRef} className="h-16 w-full" />
        </section>
      </main>
      {bottomSheet === BOTTOM_SHEET.bigRegion && <BigRegionBottomSheet closeBottomSheet={closeBottomSheet} refs={refs} setBigRegionFilter={setBigRegionFilter} />}
      {bottomSheet === BOTTOM_SHEET.smallRegion && (
        <SmallRegionBottomSheet
          closeBottomSheet={closeBottomSheet}
          refs={refs}
          bigRegion={filter.bigRegion as (typeof BIG_REGIONS)[number]}
          setSmallRegionFilter={setSmallRegionFilter}
        />
      )}
      {bottomSheet === BOTTOM_SHEET.calender && (
        <CalenderBottomSheet closeBottomSheet={closeBottomSheet} refs={refs} setStartDateFilter={setStartDateFilter} setEndDateFilter={setEndDateFilter} />
      )}
      {bottomSheet === BOTTOM_SHEET.gift && <GiftBottomSheet refs={refs} closeBottomSheet={closeBottomSheet} setGiftsFilter={setGiftsFilter} selected={filter.gifts} />}
    </>
  );
};

export default SearchPage;

const getInitialQuery = (searchParams: ReadonlyURLSearchParams) => {
  const initialKeyword = searchParams.get("keyword") ?? "";
  const initialSort = (SORT as ReadonlyArray<string>).includes(searchParams.get("sort") ?? "") ? (searchParams.get("sort") as (typeof SORT)[number]) : SORT[0];
  const initialBigRegion = (BIG_REGIONS as ReadonlyArray<string>).includes(searchParams.get("bigRegion") ?? "")
    ? (searchParams.get("bigRegion") as (typeof BIG_REGIONS)[number] | "")
    : "";
  const initialSmallRegion = searchParams.get("smallRegion") ?? "";
  const initialStartDate = searchParams.get("startDate");
  const initialEndDate = searchParams.get("endDate");
  const initialGifts = (searchParams.get("gifts")?.split("|") as GiftType[]) ?? [];

  return { initialKeyword, initialSort, initialBigRegion, initialSmallRegion, initialStartDate, initialEndDate, initialGifts };
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  selected: boolean;
}

const FilterButton = ({ children, onClick, selected }: ButtonProps) => {
  return (
    <button onClick={onClick} className={`flex-center h-28 shrink-0 gap-4 px-8 text-14 font-500 ${selected ? "text-gray-700" : "text-gray-400"}`}>
      {children}
      <DownArrowIcon stroke={selected ? "#494F5A" : "#A0A5B1"} width="20" height="20" viewBox="0 0 24 24" />
    </button>
  );
};

const SortButton = ({ children, onClick, selected }: ButtonProps) => {
  return (
    <button onClick={onClick} className={`h-20 shrink-0 text-14 font-500 ${selected ? "text-gray-900" : "text-gray-400"}`}>
      {children}
    </button>
  );
};
