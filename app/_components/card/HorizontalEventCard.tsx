import { ScheduleDataProps } from "@/(route)/(bottom-nav)/mypage/page";
import Image from "next/image";
import HeartButton from "@/components/button/HeartButton";
import Chip from "@/components/chip/Chip";
import { formatAddress, formatDate } from "@/utils/formatString";
import { EventInfoType } from "@/types/index";
import NoImage from "@/public/image/no-profile.png";

interface Props {
  data: EventInfoType | ScheduleDataProps;
  hasHeart?: boolean;
  onHeartClick?: () => void;
}

const HorizontalEventCard = ({ data, hasHeart = false, onHeartClick }: Props) => {
  const formattedDate = formatDate(data.startDate, data.endDate);
  const formattedAddress = formatAddress(data.address);

  return (
    <div className="flex w-full items-center gap-12 border-b border-gray-50 bg-transparent py-12">
      <div className="relative h-112 w-84 shrink-0">
        <Image src={data.eventImages?.[0] || NoImage} className="rounded-[0.4rem] object-cover" fill alt="행사 포스터" />
      </div>
      <div className="relative flex w-full min-w-160 flex-col justify-center gap-4">
        <div className="absolute right-0 top-0">
          <HeartButton isSmall isSelected={hasHeart} onClick={onHeartClick} />
        </div>
        <h3 className="w-200 truncate text-16 font-600">{data.placeName}</h3>
        <div className="flex w-full gap-8">
          <span className="text-16 font-600">{data.artists[0]}</span>
          <Chip kind="event" label={data.eventType} />
        </div>
        <p className="h-16 text-12 font-600 text-gray-400">
          <span className="mr-8 border-r border-gray-400 pr-8">{formattedDate}</span>
          <span>{formattedAddress}</span>
        </p>
        <ul className="flex flex-wrap gap-4">{data.tags?.map((tag, i) => <Chip kind="goods" label={tag} key={i} />)}</ul>
      </div>
    </div>
  );
};

export default HorizontalEventCard;
