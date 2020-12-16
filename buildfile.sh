npm config set user root

export no_proxy=10.10.10.0,tlinux-mirror.tencent-cloud.com,tlinux-mirrorlist.tencent-cloud.com,localhost,.oa.com,.local,$no_proxy

echo "WORKSPACE:${WORKSPACE}"

# work_folder=${WORKSPACE}

# if [ -n "$work_folder" ]; then
  # echo "work_folder:$work_folder"
  # cd $work_folder
# fi

npm install --unsafe-perm

npm run build

