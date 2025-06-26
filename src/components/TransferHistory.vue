<template>
  <div>
    <a-modal v-model:open="open" title="Lịch Sử Chuyển Giao và Báo Cáo" :footer="null" @ok="handleOk" :bodyStyle="{ maxHeight: '60vh', overflowY: 'auto' }">
      <template v-if="timelineItems.length">
        <br>
        <a-timeline>
          <a-timeline-item v-for="(item, idx) in timelineItems" :key="idx">
            <div v-if="item.type === 'transfer'">
              <strong>[Chuyển giao]</strong><br />
              <strong>Người nhận:</strong> {{ item.content.nguoiNhan }}<br />
              <strong>Mô tả:</strong> {{ item.content.moTa }}<br />
              <strong>Ngày nhận:</strong> {{ dayjs(item.content.ngayNhan).format("DD/MM/YYYY HH:mm") }}<br />
              <strong>Ngày hoàn tất:</strong> {{ item.content.ngayHoanTat ? dayjs(item.content.ngayHoanTat).format("DD/MM/YYYY HH:mm") : "Chưa xác định" }}<br />
              <strong>Trạng thái:</strong> {{ item.content.trangThai }}
            </div>
            <div v-else-if="item.type === 'report'">
              <strong>[Báo cáo]</strong><br />
              <strong>Thời gian:</strong> {{ dayjs(item.time).format("DD/MM/YYYY HH:mm") }}<br />
              <strong>Mô tả:</strong> {{ item.content.moTa }}<br />
              <strong>Tiến độ:</strong> {{ item.content.tienDoCaNhan }}%<br />
              <template v-if="item.content.idDinhKem">
                <strong>File đính kèm:</strong>
                <a
                  href="#"
                  @click.prevent="openFileDetail(item.content.idDinhKem)"
                >
                  {{ item.content.fileName || 'Xem chi tiết file' }}
                </a>
              </template>
            </div>
          </a-timeline-item>
        </a-timeline>
      </template>
      <template v-else>
        <p>Không có dữ liệu lịch sử.</p>
      </template>
    </a-modal>
  </div>
  <FileDetail
    ref="fileModal"
    :file="selectedFile"
    :task-creator-id="user?.id"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import dayjs from "dayjs";
import AssignService from "@/services/PhanCong.service";
import TaskService from "@/services/CongViec.service";
import FileService from '@/services/File.service';
import FileDetail from '@/components/FileDetail.vue';

const props = defineProps<{ 
  transfers: any[],
  assign: string,
  taskId: string
}>();

const open = ref<boolean>(false);
const timelineItems = ref<any[]>([]);
const fileModal = ref(null);
const selectedFile = ref(null);
const user = ref(null);

const showModal = async () => {
  open.value = true;
  await loadTimeline();
};

const handleOk = () => {
  open.value = false;
};

const loadTimeline = async () => {
  if (!props.transfers || props.transfers.length === 0) return;

  const items = [];
  const assignIds = props.transfers.map(t => t.id);

  // Chuyển giao
  for (const item of props.transfers) {
    items.push({
      type: 'transfer',
      time: item.ngayNhan || null,
      content: {
        nguoiNhan: item.nguoiNhan?.tenNV || item.idNguoiNhan || 'Không rõ',
        moTa: item.moTa || '',
        ngayNhan: item.ngayNhan,
        ngayHoanTat: item.ngayHoanTat,
        trangThai: item.trangThai || ''
      }
    });
  }

  // Báo cáo từ tất cả phân công
  for (const assignId of assignIds) {
    const reports = await AssignService.getReport(assignId);
    for (const rpt of reports) {
      let fileName = null;

      if (rpt.idDinhKem) {
        try {
          const fileInfo = await FileService.getFileById(rpt.idDinhKem);
          fileName = fileInfo?.tenFile || null;
        } catch (e) {
          console.warn(`Không lấy được tên file cho id ${rpt.idDinhKem}`, e);
        }
      }

      items.push({
        type: 'report',
        time: rpt.ngayCapNhat,
        content: {
          moTa: rpt.moTa,
          tienDoCaNhan: rpt.tienDoCaNhan,
          idDinhKem: rpt.idDinhKem,
          fileName: fileName
        }
      });
    }
  }

  timelineItems.value = items
    .filter(i => i.time)
    .sort((a, b) => dayjs(b.time).unix() - dayjs(a.time).unix());
};

onMounted(async () => {
  user.value = await TaskService.getTaskById(props.taskId).then(task => task.idNguoiTao || "");
});

const openFileDetail = async (fileId) => {
  try {
    const fileData = await FileService.getFileById(fileId); // 🟡 đảm bảo API này tồn tại
    selectedFile.value = fileData;
    fileModal.value?.showModal();
  } catch (err) {
    console.error("Không thể mở file:", err);
  }
};

defineExpose({ showModal });
</script>