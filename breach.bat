::删除本地分支beta
git branch -d beta

::删除远程分支beta
git push origin --delete beta

::切换到develop分支
git checkout develop

::以develop为源创建本地分支beta
git checkout -b beta

::将本地beta分支作为远程beta分支
git push origin beta

::切换到develop分支
git checkout develop

echo. & pause 