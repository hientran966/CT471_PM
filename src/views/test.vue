<template>
    <a-card title="Tên công việc" style="width: 300px; border-radius: 2px solid #e8e8e8;">
        <template #extra><a href="#">Xem</a></template>
        <p><strong>ID:</strong> CV000001</p>
        <p><strong>Người tham gia:</strong></p>
        <a-avatar-group :max-count="2" :max-style="{ color: '#f56a00', backgroundColor: '#fde3cf' }">
                <a-avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=2" />
                <a-avatar style="background-color: #1890ff">K</a-avatar>
                <a-tooltip title="Ant User" placement="top">
                <a-avatar style="background-color: #87d068">
                        <template #icon><UserOutlined /></template>
                </a-avatar>
                </a-tooltip>
                <a-avatar style="background-color: #1890ff">
                <template #icon><AntDesignOutlined /></template>
                </a-avatar>
        </a-avatar-group>
        <p><strong>Deadline:</strong>1/1/2025</p>
    </a-card>
</template>
