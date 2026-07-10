import {
  IconBolt,
  IconFlame,
  IconHorse,
  IconPointFilled,
  IconRosetteNumber5,
  IconRosetteNumber9,
  IconStack2,
  IconTargetArrow,
  IconTrophy,
  type Icon,
} from "@tabler/icons-react";
import { IconTopHat } from "@/components/IconTopHat";
import { AWARDS, type Award } from "@/types/record";

// 各アワードを象徴するアイコン。記録一覧などでテキストの代わりに表示する。
export const AWARD_ICONS: Record<Award, Icon> = {
  [AWARDS.ONE_BULL]: IconPointFilled,
  [AWARDS.LOW_TON]: IconFlame,
  [AWARDS.HIGH_TON]: IconBolt,
  [AWARDS.TON_80]: IconTrophy,
  [AWARDS.HAT_TRICK]: IconTopHat,
  [AWARDS.THREE_IN_THE_BLACK]: IconTargetArrow,
  [AWARDS.THREE_IN_A_BED]: IconStack2,
  [AWARDS.WHITE_HORSE]: IconHorse,
  [AWARDS.FIVE_MARK]: IconRosetteNumber5,
  [AWARDS.NINE_MARK]: IconRosetteNumber9,
};
