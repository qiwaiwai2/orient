import axios from '@/utils/request.js'
import QS from 'qs'
/**
 * 赛事
 */
export function findAllCompetition(){//赛事列表
    return axios.post('along/CrossCompetitionController/findAllCompetition')
}
export function findEntity(competitionId){//赛事下面的赛项
    return axios.post('along/CrossCompetitionController/findEntity',QS.stringify({competitionId:competitionId}))
}
// export function findListAndPostBack(competitionId,competitionItemId,groupId){//获取赛事赛项组别下的人员
//     return axios.post('along/CrossSportsmanController/findListAndPostBack',QS.stringify({competitionId:competitionId,competitionItemId:competitionItemId,groupId:groupId}))
// }
export function findListAndPostBack(competitionId,competitionItemId,groupId){//根据时间和人员获取轨迹对比数据
    return axios({
        method:"post",
          url:"along/CrossSportsmanController/findEntityList",
          data:JSON.stringify({
            competitionId:competitionId,
            competitionItemId:competitionItemId,
            groupId:groupId,
          }),            //参数
          headers:{
              'Content-Type':'application/json;charset=UTF-8;'   
          }
    })
}

export function findLinePointData(competitionId,competitionItemId,groupId){//获取点列表
    return axios.post('along/CrossLineController/findLinePointData',QS.stringify({competitionId:competitionId,competitionItemId:competitionItemId,groupId:groupId}))
}

export function findListAndGpsData(params){//根据时间和人员获取轨迹对比数据
    return axios({
        method:"post",
          url:"along/CrossSportsmanController/findListAndGpsData",
          data:JSON.stringify({
            competitionId:params.competitionId,
            competitionItemId:params.competitionItemId,
            groupId:params.groupId,
            sIds:params.sportsmanIds,
            startTime:params.startTime,
            endTime:params.endTime
          }),            //参数
          headers:{
              'Content-Type':'application/json;charset=UTF-8;'   
          }
    })
}
export function findListAndGpsDataByPoint(params){//根据中间点和人员获取轨迹对比数据
    return axios({
        method:"post",
          url:"along/CrossSportsmanController/findListAndGpsDataByPoint",
          data:JSON.stringify({
            competitionId:params.competitionId,
            competitionItemId:params.competitionItemId,
            groupId:params.groupId,
            sIds:params.sportsmanIds,
            startPoint:params.startPoint,
            endPoint:params.endPoint
          }),            //参数
          headers:{
              'Content-Type':'application/json;charset=UTF-8;'   
          }
    })
}
export function selectGpsData(params){//获取历史记录
    console.log(JSON.stringify(params))
    // return axios.post('along/CrossGpsDataController/selectGpsData',QS.stringify({startTime:startTime,endTime:endTime}))
    return axios({
        method:"POST",
        url:"along/CrossSportsmanController/findListAndGpsData",
        data:JSON.stringify({
            competitionId:params.competitionId,
            competitionItemId:params.competitionItemId,
            groupId:params.groupId,
            sIds:params.sportsmanIds,
            startTime:params.startTime,
            endTime:params.endTime
        }), //参数
        dataType:'json',
        headers:{
            'Content-Type':'application/json;charset=UTF-8;'   
        }
    })
}
export function findListAndGpsDataByStartTime(params){//最新----根据时间和人员获取轨迹对比数据
    return axios({
        method:"post",
          url:"along/CrossSportsmanController/findListAndGpsDataByStartTime",
          data:JSON.stringify({
            competitionId:params.competitionId,
            competitionItemId:params.competitionItemId,
            groupId:params.groupId,
            // sportsmanList:params.sportsmanIds
          }),            //参数
          headers:{
              'Content-Type':'application/json;charset=UTF-8;'   
          }
    })
}
export function findListAndGpsDataByLocaltion(params){//根据坐标获取gps数据
    return axios({
        method:"post",
          url:"along/CrossSportsmanController/findListAndGpsDataByLocaltion",
          data:JSON.stringify({
            sportsmanIds:params.sIds,
            competitionId:params.competitionId,
            competitionItemId:params.competitionItemId,
            groupId:params.groupId,
            startLongitude:params.startLongitude,
            startLatitude:params.startLatitude,
          }),//参数
          headers:{
              'Content-Type':'application/json;charset=UTF-8;'   
          }
    })
}
export function mapfindEntity(competitionId,competitionItemId,groupId){ //获取地图数据
    return axios({
        method:"post",
        url:"along/CrossMapController/findEntity",
        data:JSON.stringify({
            competitionId:competitionId,
            competitionItemId:competitionItemId,
            groupId:groupId,
        }),       
        headers:{
            'Content-Type':'application/json;charset=UTF-8;'   
        }
    })
}