<template>
    <div>
        <div class="left" v-show="!showSet">
            <div class="set">
                <img src="../assets/images/set.png" @click="showSetModel" alt="">
                <div>
                    <input type="text" placeholder="Competitors...">
                </div>
            </div>
            <div class="selectAll">
                <span @click="selectAll" :class="isSelectAll?'selectAllActive':''"></span>
                <span>Select All</span> 
            </div>
            <ul class="player_list">
                <li v-for="(item,index) in playInfo" :key="index" :class="item.active?'player_active':''"  @click="selectPlay(index)">
                    <div class="player_info">
                        <p>
                            <span :style="{backgroundColor:item.isSelect?item.color:'#fff'}" @click.stop="selectPlayer(index,item.id)"></span>
                            <span>{{item.name}}</span>
                        </p>
                        <p>
                            <!-- <span>11:23:00</span>
                            <span>0km/h</span>
                            <span>0.00km</span>
                            <span>PRE</span> -->
                            <span>{{item.nationality}}   {{item.no}}</span>
                        </p>
                        <p v-show="isplay">
                            <span>{{item.totalDistance}} km</span>
                            <span>{{item.speed}} km/h</span>
                        </p>
                        
                    </div>
                    <div class="play_detail" v-show="item.active">
                        
                        <p>
                            <span @click.stop="select_effect(index,'center')" :class="item.centerSet?'':''">Center</span>
                            <span @click.stop="select_effect(index,'highlight')" :class="item.highlightset?'setActive':''">Highlight OFF</span>
                            <!-- <span @click.stop="select_effect(index,'autocenter')" :class="item.autocenterset?'setActive':''">Autocenter OFF</span> -->
                        </p>
                        <p>
                            <span @click.stop="select_effect(index,'fullroute')" :class="item.fullrouteset?'setActive':''">Full route OFF</span>
                        </p>
                        <!-- <p class="color_show" :style="{backgroundColor:item.color}"></p> -->
                    </div>
                </li>
            </ul>
        </div>
        <div class="left_set" v-show="showSet">
            <div class="set_btn" @click="showSetModel">
                <img src="../assets/images/setBtn.png" alt="">
            </div>
            <a-menu
                @click="handleClick"
                :openKeys.sync="openKeys"
                mode="inline"
                theme="dark"
                class="menutest"
                style="background:#59ACF8"
            >
                <!-- <a-sub-menu key="sub1">
                    <span slot="title">App Mode</span>
                    <a-menu-item key="1" class="set_detail">
                        <p>Desktop</p>
                        <p>Mobile</p>
                    </a-menu-item>
                </a-sub-menu> -->
                <a-sub-menu key="sub2">
                    <span slot="title">Tail</span>
                    <a-menu-item  style="padding-left:30px"  key="2" class="set_detail">
                        <p>Tail</p>
                        <a-slider class="slider" @change="tailOnChange" :defaultValue="10" :min="2" :max="300"  :disabled="disabled" />
                        <p>Route</p>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="sub3">
                    <span slot="title">Marker, line & map</span>
                    <a-menu-item style="padding-left:30px" key="3" class="set_detail">
                        <p>Maker Size:{{markerWH}}px</p>
                        <a-slider class="slider" @change="markeronChange" v-model="markerWH" :min="8" :defaultValue="13" :max="30" :disabled="disabled" />
                        <p>Letters:12px</p>
                        <a-slider class="slider" @change="letteronChange" v-model="letterfontsize" :defaultValue="12" :min="12" :max="30" :disabled="disabled" />
                        <!-- <p>Line Width:6px</p>
                        <a-slider class="slider" @change="onChange" :defaultValue="defaultValue" :disabled="disabled" />
                        <p>Line opacity:80%</p>
                        <a-slider class="slider" @change="onChange" :defaultValue="defaultValue" :disabled="disabled" /> -->
                        <p>Map opacity: {{mapOpacity}}</p>
                        <a-slider class="slider" @change="mapOpacityonChange" v-model="mapOpacity" :defaultValue="defaultValue" :min="0" :max="1" :step="0.01" :disabled="disabled" />
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="sub4" style="display:none">
                    <span slot="title">Competitor</span>
                    <a-menu-item  style="padding-left:30px"  key="4" class="set_detail">
                        <p>show</p>
                        <a-radio-group class="radioSet" name="radioGroup" :defaultValue="1">
                            <a-radio style="margin-right:0" :value="1">km/h</a-radio>
                            <a-radio style="margin-right:0" :value="2">min/km</a-radio>
                            <a-radio style="margin-right:0" :value="3">knot</a-radio>
                        </a-radio-group>
                        <p>hide</p>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="sub5" style="display:none">
                    <span slot="title">Offset</span>
                    <a-menu-item  style="padding-left:30px"  key="5" class="set_detail">
                        <p>Langedal</p>
                        <div class="LangedalSet">
                            <div>
                                <input type="text" value="0:00">
                                <span>OK</span>
                            </div>
                            <div>Reset all offsets</div>
                        </div>
                    </a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="sub6" style="display:none">
                    <span slot="title">Display Settings</span>
                    <a-menu-item  style="padding-left:30px"  key="6" class="set_detail">
                        <a-checkbox-group @change="checkboxonChange">
                            <a-row>
                                <a-col :span="12"><a-checkbox class="checkbosSet" value="A">National flag</a-checkbox></a-col>
                                <a-col :span="12"><a-checkbox class="checkbosSet" value="B">Nationality</a-checkbox></a-col>
                                <a-col :span="12"><a-checkbox class="checkbosSet" value="C">Name</a-checkbox></a-col>
                                <a-col :span="12"><a-checkbox class="checkbosSet" value="D">ID</a-checkbox></a-col>
                            </a-row>
                        </a-checkbox-group>
                    </a-menu-item>
                </a-sub-menu>
            </a-menu>
        </div>
    </div>
</template>>
<script>
export default {
    data(){
        return {
            showSet:false,//显示设置
            isSelectAll:true,//是否全选
            openKeys: ['sub1'],
            defaultValue:0,
            disabled:false,
            endTimeList:null,//结束时间
            markerWH:13,//marker大小
            letterfontsize:12,//marker文字大小
            mapOpacity:0.7,//地图透明度
            isplay:false, //是否直播
        }
    },
    props:[
        'playInfo',
        'createmap',
        'manList',
        'createmap'
    ],
    mounted(){
        let query = this.$route.query;
        if(query.isplay==1){ //直播
            this.isplay = true
        }else{
            this.isplay = false
        }
        if(query.gameItemId == '51a0d31f9d6c40258f9d9067e59ff2b5'){//中距离
            this.endTimeList = [
                {"club":"FRA","name":"RANOUX M","cardno":8651026,"endTime":"11:10:05"},{"club":"RUS","name":"EFIMOVA N","cardno":8651106,"endTime":"10:44:08"},{"club":"SUI","name":"SCHWAB AB","cardno":8651126,"endTime":"11:06:28"},{"club":"CHN","name":"LI M","cardno":8650968,"endTime":"10:39:18"},{"club":"DEN","name":"RASMUSSEN M.L","cardno":8651082,"endTime":"11:28:06"},{"club":"EST","name":"RIHMA A","cardno":8651078,"endTime":"11:00:06"},{"club":"ROU","name":"MARINELA ELENA P","cardno":8651090,"endTime":"11:13:04"},{"club":"LTU","name":"GVILDYTE TE","cardno":8651037,"endTime":"11:12:23"},{"club":"SWE","name":"HOLMGREN A","cardno":8651108,"endTime":"11:28:48"},{"club":"NED","name":"KLAASSEN R","cardno":8651006,"endTime":"11:52:04"},{"club":"BEL","name":"MALENGREAU A","cardno":8650928,"endTime":"12:01:21"},{"club":"POL","name":"OLEJNIK A","cardno":8651048,"endTime":"11:05:37"},{"club":"KAZ","name":"VLASSOVA M","cardno":8650980,"endTime":"11:35:29"},{"club":"RUS","name":"NOVIKOVA I","cardno":8650973,"endTime":"11:05:58"},{"club":"POL","name":"WISNIEWSKA H","cardno":8650978,"endTime":"11:21:58"},{"club":"CHN","name":"YANG Q","cardno":8650944,"endTime":"11:05:19"},{"club":"LTU","name":"VALAITE I","cardno":8651025,"endTime":"11:29:53"},{"club":"ESP","name":"GARRIDO HENS EM","cardno":8650923,"endTime":"11:45:45"},{"club":"FRA","name":"FOLTZER C","cardno":8651079,"endTime":"11:28:40"},{"club":"GER","name":"LIEBLER SC","cardno":8651058,"endTime":"11:52:45"},{"club":"LAT","name":"KARKLINA E","cardno":8650956,"endTime":"11:39:23"},{"club":"ROU","name":"ALINA GEORGIANA A","cardno":8651075,"endTime":"12:20:28"},{"club":"BEL","name":"de BRIEY V","cardno":8650919,"endTime":"12:02:16"},{"club":"EST","name":"HIRV E","cardno":8651092,"endTime":"11:34:02"},{"club":"BRA","name":"FRANCO M","cardno":8651009,"endTime":"11:48:10"},{"club":"BUL","name":"IVANOVA Y","cardno":8650921,"endTime":"12:18:17"},{"club":"NED","name":"MALLEKOOTE M","cardno":8651124,"endTime":"12:20:28"},{"club":"SWE","name":"SALEN I","cardno":8651149,"endTime":"11:44:34"},{"club":"BUL","name":"GRIGOROVA A","cardno":8650904,"endTime":"11:51:42"},{"club":"LAT","name":"BERTUKA K","cardno":8651028,"endTime":"11:47:55"},{"club":"CHN","name":"LI X","cardno":8651122,"endTime":"11:39:32"},{"club":"RUS","name":"RUDNAIA A","cardno":8651120,"endTime":"11:41:29"},{"club":"FRA","name":"BEAUVIR M","cardno":8651150,"endTime":"12:05:51"},{"club":"DEN","name":"ISHOEI A","cardno":8651091,"endTime":"12:18:13"},{"club":"LTU","name":"ALELIUNIENE V","cardno":8651083,"endTime":"11:59:26"},{"club":"EST","name":"JOONAS L","cardno":8650932,"endTime":"12:01:35"},{"club":"BEL","name":"VAN DE VELDE L","cardno":8650924,"endTime":"12:17:35"},{"club":"KAZ","name":"MOLDASHEVA E","cardno":8650964,"endTime":"12:23:56"},{"club":"SUI","name":"JENZER SA","cardno":8651145,"endTime":"11:59:09"},{"club":"SLO","name":"FLERIN DREVENSEK M","cardno":8651046,"endTime":"12:09:16"},{"club":"ROU","name":"ROXANA FLAVIA MAR.","cardno":8651095,"endTime":"12:52:49"},{"club":"SWE","name":"YNGVESSON K","cardno":8651102,"endTime":"12:23:46"},{"club":"ESP","name":"MARTIN IGLESIAS MJ","cardno":8651129,"endTime":"12:50:26"},{"club":"NED","name":"BREIMER T","cardno":8651107,"endTime":"12:43:39"},{"club":"POL","name":"GWOZDZ E","cardno":8650957,"endTime":"12:22:16"},{"club":"POR","name":"MOREIRA M","cardno":8651013,"endTime":"12:27:31"},{"club":"BRA","name":"LENZ E","cardno":8650915,"endTime":"12:29:35"},{"club":"EST","name":"VANJUK M","cardno":8651045,"endTime":"12:29:40"},{"club":"FRA","name":"BASSET I","cardno":8651062,"endTime":"12:19:46"},{"club":"SUI","name":"ROOS E","cardno":8651130,"endTime":"12:19:24"},{"club":"BRA","name":"RONIAK E","cardno":8650922,"endTime":"12:45:34"},{"club":"AUT","name":"KADAN U","cardno":8650909,"endTime":"12:29:10"},{"club":"LAT","name":"VIKE L","cardno":8651100,"endTime":"12:30:30"},{"club":"SWE","name":"WICKBOM E","cardno":8651105,"endTime":"12:39:21"},{"club":"BEL","name":"DESCHEPPER A","cardno":8650916,"endTime":"13:00:00"},{"club":"ESP","name":"RUIZ ALONSO E","cardno":8651041,"endTime":"12:39:25"},{"club":"RUS","name":"MIRONOVA S","cardno":8651035,"endTime":"12:33:21"},{"club":"NED","name":"SCHRADER L","cardno":8650961,"endTime":"13:00:59"},{"club":"DEN","name":"NAJBJERG NG","cardno":8651112,"endTime":"12:55:24"},{"club":"CHN","name":"SHEN N","cardno":8650946,"endTime":"12:41:27"},{"club":"KAZ","name":"NAZYROVA A","cardno":8651040,"endTime":"13:05:22"},{"club":"LTU","name":"PAUZAITE S","cardno":8651089,"endTime":"12:50:11"},{"club":"POL","name":"HORNIK A","cardno":8651110,"endTime":"12:45:17"},{"club":"CHI","name":"TORRES J","cardno":8650996,"endTime":"11:30:19"},{"club":"SWE","name":"NIKOLAUSSON A","cardno":8651036,"endTime":"10:59:04"},{"club":"VEN","name":"PRIETO L","cardno":8650967,"endTime":"11:34:42"},{"club":"NED","name":"BLOKZIJL J","cardno":8651125,"endTime":"12:03:04"},{"club":"ROU","name":"ISTVAN FERENC S","cardno":8651113,"endTime":"11:13:57"},{"club":"SUI","name":"SCHNEIDER FA","cardno":8651057,"endTime":"10:54:34"},{"club":"GER","name":"GOEHLER M","cardno":8651043,"endTime":"11:49:24"},{"club":"ESP","name":"BERNAL GOERZ J.M","cardno":8650986},{"club":"ARM","name":"MKHITARYAN Y","cardno":8650949,"endTime":"12:25:52"},{"club":"CHN","name":"HOU J","cardno":8650918,"endTime":"10:58:52"},{"club":"RUS","name":"DOBRYNIN S","cardno":8651015,"endTime":"10:54:44"},{"club":"POL","name":"PODZINSKI R","cardno":8651148,"endTime":"11:08:47"},{"club":"DEN","name":"LARSEN HKN","cardno":8651132,"endTime":"11:45:17"},{"club":"FRA","name":"MELINARD L","cardno":8651042,"endTime":"11:16:57"},{"club":"IRI","name":"TATAR MK","cardno":8651067,"endTime":"11:37:06"},{"club":"ECU","name":"BRAVO CONZA OA","cardno":8651064,"endTime":"11:30:12"},{"club":"BEL","name":"CAMPIONE M","cardno":8650948,"endTime":"11:21:45"},{"club":"UAE","name":"ALYAMMAHI Saeed","cardno":8650963,"endTime":"11:28:34"},{"club":"DEN","name":"JENSEN JM","cardno":8651052,"endTime":"11:33:11"},{"club":"RUS","name":"TAMBASOV I","cardno":8651123,"endTime":"11:06:33"},{"club":"AUT","name":"REINER MH","cardno":8650953,"endTime":"11:13:33"},{"club":"GER","name":"STEIGER D","cardno":8650999,"endTime":"11:27:20"},{"club":"SWE","name":"STRIDH D","cardno":8651050,"endTime":"11:28:28"},{"club":"VEN","name":"CONTRERAS N","cardno":8651118,"endTime":"12:35:00"},{"club":"ECU","name":"NINASUNTA IZA AW","cardno":8651038,"endTime":"11:26:57"},{"club":"ARM","name":"MANASYAN Y","cardno":8650939,"endTime":"13:09:15"},{"club":"UAE","name":"ALZEYOUDI S","cardno":8650977,"endTime":"11:30:20"},{"club":"ESP","name":"PERPEN MARTINEZ AE","cardno":8651081,"endTime":"11:30:12"},{"club":"CHI","name":"GATICA R","cardno":8650950,"endTime":"11:29:55"},{"club":"POL","name":"RICHERT M","cardno":8650984,"endTime":"11:19:21"},{"club":"ROU","name":"IONUT ALIN Z","cardno":8651016,"endTime":"11:16:40"},{"club":"IRI","name":"ALI REZA K","cardno":8651115,"endTime":"11:59:01"},{"club":"FRA","name":"DANIEL I","cardno":8650951,"endTime":"11:28:23"},{"club":"SUI","name":"MEIER CS","cardno":8650941,"endTime":"11:20:35"},{"club":"BEL","name":"DUSZA S","cardno":8651070,"endTime":"11:47:57"},{"club":"BRA","name":"TOGNI G","cardno":8650935,"endTime":"11:30:47"},{"club":"NED","name":"van den NOUWELANT","cardno":8651060,"endTime":"12:11:30"},{"club":"FIN","name":"KIRMULA M","cardno":8651029},{"club":"CHN","name":"YANG X","cardno":8651049,"endTime":"11:27:06"},{"club":"SRB","name":"SAVIC S","cardno":8651119,"endTime":"11:45:41"},{"club":"LTU","name":"BARTKEVICIUS A","cardno":8651047,"endTime":"11:32:18"},{"club":"SWE","name":"JOHANSSON P","cardno":8651002,"endTime":"11:45:41"},{"club":"BEL","name":"GROSDENT S","cardno":8650907,"endTime":"11:55:12"},{"club":"URU","name":"CHRISTIAN JESUS CB","cardno":8650962,"endTime":"12:01:11"},{"club":"CHI","name":"GARCIA H","cardno":8650901,"endTime":"11:43:13"},{"club":"ESP","name":"VERA GUERRERO C","cardno":8651136,"endTime":"11:50:16"},{"club":"ROU","name":"ALEXANDRU CATALIN","cardno":8651087,"endTime":"12:14:36"},{"club":"BRA","name":"NITSCH C","cardno":8650905,"endTime":"11:45:35"},{"club":"RUS","name":"NAKONECHNYI D","cardno":8651138,"endTime":"11:31:03"},{"club":"AUT","name":"BONEK J","cardno":8650933,"endTime":"11:36:36"},{"club":"FRA","name":"GIRES N","cardno":8651039,"endTime":"11:44:11"},{"club":"ECU","name":"CHACON TAPIA MR","cardno":8651097,"endTime":"11:53:18"},{"club":"VEN","name":"GEDLER J","cardno":8651017,"endTime":"13:43:22"},{"club":"UAE","name":"ALHASSANI S","cardno":8650960,"endTime":"12:00:14"},{"club":"DEN","name":"HELWEG LA","cardno":8651023,"endTime":"12:14:27"},{"club":"POL","name":"WENSLAW M","cardno":8650992,"endTime":"11:53:34"},{"club":"GER","name":"HEININGER D","cardno":8650971,"endTime":"12:21:50"},{"club":"CHN","name":"DUAN A","cardno":8650943,"endTime":"12:29:18"},{"club":"ARM","name":"YAKHANYAN H","cardno":8650931,"endTime":"14:24:14"},{"club":"IRI","name":"KOSHKI S","cardno":8650987,"endTime":"12:09:04"},{"club":"FIN","name":"SALONEN M","cardno":8651111,"endTime":"11:50:03"},{"club":"NED","name":"POSTHOUWER R","cardno":8651071,"endTime":"12:22:06"},{"club":"SUI","name":"HUBMANN M","cardno":8651011,"endTime":"11:43:17"},{"club":"BEL","name":"SIMKENS G","cardno":8650913,"endTime":"11:58:25"},{"club":"BRA","name":"NASCIMENTO F","cardno":8650929,"endTime":"11:58:45"},{"club":"ECU","name":"HERRERA SALAZAR JD","cardno":8651055,"endTime":"12:17:53"},{"club":"CHI","name":"CIFUENTES J","cardno":8650908,"endTime":"12:13:32"},{"club":"FIN","name":"EEROLA M","cardno":8651135,"endTime":"11:40:28"},{"club":"LTU","name":"STULGYS D","cardno":8651032,"endTime":"12:00:14"},{"club":"HUN","name":"VASS TC","cardno":8651063,"endTime":"12:33:15"},{"club":"SUI","name":"EGGER JE","cardno":8650979,"endTime":"11:49:56"},{"club":"UAE","name":"ALYAMMAHI Salem","cardno":8651104,"endTime":"12:47:22"},{"club":"ROU","name":"PAUL MARIUS BC","cardno":8651088,"endTime":"12:13:41"},{"club":"POL","name":"DUTKOWSKI M","cardno":8651033,"endTime":"11:58:09"},{"club":"BUL","name":"OVCHAROV A","cardno":8650926,"endTime":"12:36:52"},{"club":"RUS","name":"KHRAMOV A","cardno":8651004,"endTime":"11:57:57"},{"club":"CHN","name":"CONG X","cardno":8650930,"endTime":"12:12:36"},{"club":"GER","name":"FRIELING B","cardno":8651018,"endTime":"12:34:56"},{"club":"KAZ","name":"NAZYROV A","cardno":8651094,"endTime":"12:21:19"},{"club":"AUT","name":"KASTNER N","cardno":8650945,"endTime":"12:13:11"},{"club":"SRB","name":"MILIC M","cardno":8651021,"endTime":"12:25:31"},{"club":"DEN","name":"MIKKELSEN A","cardno":8651020,"endTime":"12:36:59"},{"club":"VEN","name":"ROJAS O","cardno":8651010,"endTime":"12:34:56"},{"club":"IRI","name":"SADEGZADEH AKBARA.","cardno":8651008,"endTime":"12:23:28"},{"club":"NED","name":"SMULDERS M","cardno":8651133,"endTime":"12:29:03"},{"club":"SWE","name":"LIF A","cardno":8650966,"endTime":"12:19:49"},{"club":"EST","name":"RJABOSHKIN S","cardno":8651069,"endTime":"12:25:11"},{"club":"ESP","name":"LOPEZ LOPEZ A","cardno":8650914,"endTime":"12:30:27"},{"club":"FRA","name":"RAUTURIER Q","cardno":8651077,"endTime":"12:11:19"},{"club":"LAT","name":"JUBELIS A","cardno":8651099,"endTime":"12:23:15"},{"club":"RUS","name":"TCVETKOV D","cardno":8651030,"endTime":"12:11:27"},{"club":"KAZ","name":"ADAMOVICH D","cardno":8651141,"endTime":"12:34:53"},{"club":"FIN","name":"SAARI A","cardno":8651098,"endTime":"12:21:13"},{"club":"LTU","name":"ALELIUNAS V","cardno":8651068,"endTime":"12:24:47"},{"club":"SRB","name":"IVKOVIC S","cardno":8651109,"endTime":"12:52:33"},{"club":"BEL","name":"JANSSENS T","cardno":8650947,"endTime":"12:34:47"},{"club":"CHI","name":"ARRIAGADA J","cardno":8650938,"endTime":"12:43:24"},{"club":"SWE","name":"ANDERSSON W","cardno":8650983,"endTime":"12:31:44"},{"club":"DEN","name":"ANDERSEN JRR","cardno":8651005,"endTime":"12:56:40"},{"club":"BRA","name":"EV I","cardno":8650911,"endTime":"12:25:56"},{"club":"FRA","name":"RIO N","cardno":8651061,"endTime":"12:23:31"},{"club":"EST","name":"HEINMANN K","cardno":8650975,"endTime":"12:25:48"},{"club":"IRI","name":"MOSLEM ASLANI K","cardno":8651059,"endTime":"13:19:11"},{"club":"HUN","name":"MOLNAR Z","cardno":8651076,"endTime":"12:51:56"},{"club":"SUI","name":"KYBURZ A","cardno":8651003,"endTime":"12:25:43"},{"club":"ECU","name":"NINASUNTA YUGCHA L","cardno":8651027,"endTime":"12:48:06"},{"club":"GER","name":"KARSTAEDT S","cardno":8651031,"endTime":"13:11:39"},{"club":"NED","name":"HEREIJGERS R","cardno":8650998,"endTime":"12:58:09"},{"club":"AUT","name":"PETER M","cardno":8650920,"endTime":"12:31:58"},{"club":"BUL","name":"TERZIEV T","cardno":8650906,"endTime":"13:01:07"},{"club":"POL","name":"KOWALSKI W","cardno":8651147,"endTime":"12:31:37"},{"club":"LAT","name":"REKUNENKO A","cardno":8651012,"endTime":"12:48:20"},{"club":"ESP","name":"JIMENEZ MOLINA S","cardno":8651080,"endTime":"12:46:59"},{"club":"UAE","name":"ALKETBI K","cardno":8650955,"endTime":"13:00:42"},{"club":"VEN","name":"ROJAS J","cardno":8651142,"endTime":"13:26:24"},{"club":"ROU","name":"FELICIAN B","cardno":8651140,"endTime":"13:00:49"},{"club":"POL","name":"OLEJNIK M","cardno":8650985,"endTime":"12:37:00"},{"club":"VEN","name":"ROMERO J","cardno":8650917,"endTime":"13:26:36"},{"club":"BUL","name":"BELOMAZHEV S","cardno":8650942,"endTime":"12:46:57"},{"club":"NED","name":"van DONGEN M","cardno":8650959,"endTime":"13:27:01"},{"club":"LAT","name":"BERTUKS E","cardno":8651053,"endTime":"12:53:03"},{"club":"ECU","name":"IMBAQUINGO PAMBAQ.","cardno":8651072,"endTime":"12:56:45"},{"club":"LTU","name":"GVILDYS JV","cardno":8651051,"endTime":"12:48:02"},{"club":"HUN","name":"MORLNAR DR. A","cardno":8650903,"endTime":"13:05:39"},{"club":"ROU","name":"PAUL CONSTANTIN P","cardno":8650991,"endTime":"13:10:41"},{"club":"ESP","name":"GARCIA CRESPO JM","cardno":8651086,"endTime":"13:02:08"},{"club":"GER","name":"REHNER K","cardno":8651044,"endTime":"13:23:52"},{"club":"SWE","name":"SKOGTJAERN P","cardno":8650974,"endTime":"12:59:25"},{"club":"SUI","name":"HOWALD F","cardno":8650982,"endTime":"12:46:27"},{"club":"FIN","name":"AHO A","cardno":8650952,"endTime":"12:55:53"},{"club":"SRB","name":"CORIC Z","cardno":8651117,"endTime":"13:16:43"},{"club":"BRA","name":"SCHMITZ D","cardno":8650902,"endTime":"13:09:41"},{"club":"RUS","name":"NOVIKOV V","cardno":8650969,"endTime":"12:55:36"},{"club":"FRA","name":"TRANCHAND F","cardno":8651085,"endTime":"13:06:14"},{"club":"EST","name":"SILD L","cardno":8651056,"endTime":"12:59:48"},{"club":"KAZ","name":"SUKHONOSSOV F","cardno":8651127,"endTime":"13:19:17"},{"club":"CHN","name":"ZHENG W","cardno":8650912,"endTime":"12:57:56"},{"club":"AUT","name":"MERL R","cardno":8650940,"endTime":"12:58:52"},{"club":"DEN","name":"JENSEN TG","cardno":8651073,"endTime":"13:16:28"},{"club":"IRI","name":"TAZROO E","cardno":8651066,"endTime":"13:26:28"},{"club":"UAE","name":"ALMURSHIDI A","cardno":8651131,"endTime":"13:33:31"},{"club":"BEL","name":"ANCIAUX B","cardno":8650937,"endTime":"13:19:21"},{"club":"SUI","name":"KYBURZ M","cardno":8651001,"endTime":"13:00:00"},{"club":"LAT","name":"PAULINS A","cardno":8650997,"endTime":"13:09:37"},{"club":"FIN","name":"RUOHOLA A","cardno":8651093,"endTime":"13:10:37"},{"club":"DEN","name":"WEBER JF","cardno":8651084,"endTime":"13:34:52"},{"club":"ECU","name":"GUAMAN JEREZ ER","cardno":8650976,"endTime":"13:22:10"},{"club":"AUT","name":"YMSEN GE","cardno":8650927,"endTime":"13:08:42"},{"club":"POL","name":"PAWLAK B","cardno":8650934,"endTime":"13:15:51"},{"club":"CHN","name":"YANG C","cardno":8651074,"endTime":"13:07:07"},{"club":"GER","name":"RUECKER K","cardno":8651137,"endTime":"13:56:36"},{"club":"KAZ","name":"VLASSOV D","cardno":8651065,"endTime":"13:29:44"},{"club":"BEL","name":"LINTEN J","cardno":8650910,"endTime":"13:33:30"},{"club":"VEN","name":"DURAN J","cardno":8651134,"endTime":"14:41:48"},{"club":"LTU","name":"BELIUNAS V","cardno":8651014,"endTime":"13:25:04"},{"club":"IRI","name":"MEYSAM D","cardno":8651007,"endTime":"14:09:06"},{"club":"ESP","name":"RODRIGUEZ DOMINGU.","cardno":8651121,"endTime":"13:32:11"},{"club":"BRA","name":"PASTURIZA L","cardno":8650936,"endTime":"13:25:53"},{"club":"RUS","name":"NOVIKOV L","cardno":8651024,"endTime":"13:23:20"},{"club":"SRB","name":"POPOVIC D","cardno":8651034,"endTime":"13:40:04"},{"club":"HUN","name":"BAUMHOLCZER M","cardno":8651054,"endTime":"13:26:10"},{"club":"SWE","name":"WICKBOM R","cardno":8651143,"endTime":"13:32:02"},{"club":"EST","name":"SILD T","cardno":8650989,"endTime":"13:26:01"},{"club":"FRA","name":"BASSET L","cardno":8650970,"endTime":"13:24:50"},{"club":"ROU","name":"OVIDIU MUGUREL M","cardno":8651101,"endTime":"13:50:32"}
            ]
        }else if(query.gameItemId == '3ad480bc8440442cb1b61cf707233eb8'){//长距离
            this.endTimeList = [
                {"club":"DEN","name":"RASMUSSEN M.L","cardno":8651082,"endTime":"12:39:36"},{"club":"FRA","name":"RANOUX M","cardno":8651026,"endTime":"11:52:05"},{"club":"SWE","name":"HOLMGREN A","cardno":8651108,"endTime":"11:38:58"},{"club":"LTU","name":"GVILDYTE TE","cardno":8651037,"endTime":"11:45:58"},{"club":"NED","name":"MALLEKOOTE M","cardno":8651124,"endTime":"12:23:14"},{"club":"EST","name":"VANJUK M","cardno":8651045,"endTime":"11:30:57"},{"club":"CHN","name":"SHEN N","cardno":8650946},{"club":"POL","name":"GWOZDZ E","cardno":8650957,"endTime":"11:46:08"},{"club":"KAZ","name":"MOLDASHEVA E","cardno":8650964,"endTime":"12:13:02"},{"club":"RUS","name":"EFIMOVA N","cardno":8651106,"endTime":"11:38:09"},{"club":"BEL","name":"MALENGREAU A","cardno":8650928,"endTime":"12:17:58"},{"club":"SUI","name":"SCHWAB AB","cardno":8651126,"endTime":"11:54:45"},{"club":"EST","name":"RIHMA A","cardno":8651078,"endTime":"11:45:34"},{"club":"ESP","name":"GARRIDO HENS EM","cardno":8650923,"endTime":"12:41:16"},{"club":"GER","name":"LIEBLER SC","cardno":8651058,"endTime":"12:39:48"},{"club":"RUS","name":"NOVIKOVA I","cardno":8650973,"endTime":"11:50:15"},{"club":"KAZ","name":"VLASSOVA M","cardno":8650980,"endTime":"12:12:35"},{"club":"FRA","name":"BEAUVIR M","cardno":8651150,"endTime":"12:01:26"},{"club":"NED","name":"BREIMER T","cardno":8651107,"endTime":"12:23:05"},{"club":"LAT","name":"KARKLINA E","cardno":8650956,"endTime":"12:12:38"},{"club":"BEL","name":"de BRIEY V","cardno":8650919,"endTime":"12:36:59"},{"club":"BRA","name":"FRANCO M","cardno":8651009,"endTime":"12:22:53"},{"club":"LTU","name":"VALAITE I","cardno":8651025,"endTime":"12:12:32"},{"club":"CHN","name":"LI X","cardno":8651122},{"club":"BUL","name":"IVANOVA Y","cardno":8650921,"endTime":"13:27:45"},{"club":"ROU","name":"ALINA GEORGIANA A","cardno":8651075,"endTime":"13:02:46"},{"club":"SWE","name":"YNGVESSON K","cardno":8651102,"endTime":"12:21:42"},{"club":"POL","name":"OLEJNIK A","cardno":8651048,"endTime":"12:11:27"},{"club":"RUS","name":"MIRONOVA S","cardno":8651035,"endTime":"12:08:37"},{"club":"CHN","name":"YANG Q","cardno":8650944},{"club":"BUL","name":"GRIGOROVA A","cardno":8650904,"endTime":"12:42:08"},{"club":"ESP","name":"RUIZ ALONSO E","cardno":8651041,"endTime":"12:42:21"},{"club":"ROU","name":"MARINELA ELENA P","cardno":8651090,"endTime":"13:02:08"},{"club":"KAZ","name":"NAZYROVA A","cardno":8651040,"endTime":"12:47:40"},{"club":"NED","name":"SCHRADER L","cardno":8650961,"endTime":"13:11:19"},{"club":"FRA","name":"FOLTZER C","cardno":8651079,"endTime":"12:26:18"},{"club":"SLO","name":"FLERIN DREVENSEK M","cardno":8651046,"endTime":"12:50:30"},{"club":"POL","name":"WISNIEWSKA H","cardno":8650978,"endTime":"12:29:12"},{"club":"SWE","name":"WICKBOM E","cardno":8651105,"endTime":"12:38:05"},{"club":"BRA","name":"LENZ E","cardno":8650915,"endTime":"13:08:05"},{"club":"DEN","name":"ISHOEI A","cardno":8651091,"endTime":"12:54:53"},{"club":"LAT","name":"BERTUKA K","cardno":8651028,"endTime":"13:04:34"},{"club":"POR","name":"MOREIRA M","cardno":8651013,"endTime":"12:59:09"},{"club":"SUI","name":"JENZER SA","cardno":8651145,"endTime":"12:40:12"},{"club":"BEL","name":"VAN DE VELDE L","cardno":8650924,"endTime":"13:20:53"},{"club":"LTU","name":"ALELIUNIENE V","cardno":8651083,"endTime":"12:58:43"},{"club":"EST","name":"JOONAS L","cardno":8650932,"endTime":"12:54:39"},{"club":"NED","name":"KLAASSEN R","cardno":8651006,"endTime":"14:17:51"},{"club":"CHN","name":"LI M","cardno":8650968},{"club":"BRA","name":"RONIAK E","cardno":8650922,"endTime":"13:07:18"},{"club":"SUI","name":"ROOS E","cardno":8651130,"endTime":"12:46:45"},{"club":"AUT","name":"KADAN U","cardno":8650909,"endTime":"12:46:42"},{"club":"POL","name":"HORNIK A","cardno":8651110,"endTime":"13:01:58"},{"club":"ESP","name":"MARTIN IGLESIAS MJ","cardno":8651129},{"club":"LTU","name":"PAUZAITE S","cardno":8651089,"endTime":"13:03:08"},{"club":"ROU","name":"ROXANA FLAVIA MAR.","cardno":8651095,"endTime":"13:46:51"},{"club":"DEN","name":"NAJBJERG NG","cardno":8651112,"endTime":"13:20:42"},{"club":"SWE","name":"SALEN I","cardno":8651149,"endTime":"13:10:12"},{"club":"RUS","name":"RUDNAIA A","cardno":8651120,"endTime":"13:00:28"},{"club":"BEL","name":"DESCHEPPER A","cardno":8650916,"endTime":"14:04:50"},{"club":"FRA","name":"BASSET I","cardno":8651062,"endTime":"13:24:03"},{"club":"EST","name":"HIRV E","cardno":8651092,"endTime":"13:46:13"},{"club":"LAT","name":"VIKE L","cardno":8651100,"endTime":"13:22:04"},{"club":"UAE","name":"ALYAMMAHI Saeed","cardno":8650963,"endTime":"14:17:15"},{"club":"SWE","name":"STRIDH D","cardno":8651050,"endTime":"12:14:21"},{"club":"BEL","name":"CAMPIONE M","cardno":8650948,"endTime":"12:39:05"},{"club":"FIN","name":"KIRMULA M","cardno":8651029},{"club":"RUS","name":"TAMBASOV I","cardno":8651123,"endTime":"11:41:33"},{"club":"ESP","name":"BERNAL GOERZ J.M","cardno":8650986},{"club":"VEN","name":"GEDLER J","cardno":8651017,"endTime":"13:27:14"},{"club":"CHI","name":"GATICA R","cardno":8650950,"endTime":"13:13:12"},{"club":"FRA","name":"MELINARD L","cardno":8651042,"endTime":"12:16:34"},{"club":"ARM","name":"YAKHANYAN H","cardno":8650931,"endTime":"13:01:07"},{"club":"ROU","name":"ALEXANDRU CATALIN","cardno":8651087,"endTime":"13:02:07"},{"club":"IRI","name":"MEYSAM D","cardno":8651007},{"club":"DEN","name":"LARSEN HKN","cardno":8651132,"endTime":"13:27:32"},{"club":"ECU","name":"BRAVO CONZA OA","cardno":8651064,"endTime":"12:28:09"},{"club":"POL","name":"PODZINSKI R","cardno":8651148,"endTime":"10:49:10"},{"club":"CHN","name":"HOU J","cardno":8650918},{"club":"NED","name":"van DONGEN M","cardno":8650959,"endTime":"13:02:53"},{"club":"SUI","name":"SCHNEIDER FA","cardno":8651057,"endTime":"11:48:11"},{"club":"BRA","name":"SCHMITZ D","cardno":8650902,"endTime":"12:22:50"},{"club":"GER","name":"GOEHLER M","cardno":8651043},{"club":"AUT","name":"REINER MH","cardno":8650953},{"club":"FIN","name":"EEROLA M","cardno":8651135},{"club":"BEL","name":"DUSZA S","cardno":8651070,"endTime":"12:47:12"},{"club":"SWE","name":"JOHANSSON P","cardno":8651002,"endTime":"12:27:43"},{"club":"FRA","name":"DANIEL I","cardno":8650951,"endTime":"12:31:38"},{"club":"NED","name":"van den NOUWELANT","cardno":8651060,"endTime":"13:10:57"},{"club":"DEN","name":"JENSEN JM","cardno":8651052,"endTime":"13:19:32"},{"club":"SRB","name":"POPOVIC D","cardno":8651034,"endTime":"13:02:03"},{"club":"CHN","name":"YANG X","cardno":8651049},{"club":"CHI","name":"TORRES J","cardno":8650996,"endTime":"12:54:04"},{"club":"UAE","name":"ALKETBI K","cardno":8650955,"endTime":"13:27:56"},{"club":"POL","name":"WENSLAW M","cardno":8650992,"endTime":"12:12:24"},{"club":"RUS","name":"NOVIKOV L","cardno":8651024,"endTime":"12:13:08"},{"club":"GER","name":"STEIGER D","cardno":8650999,"endTime":"13:39:51"},{"club":"ROU","name":"FELICIAN B","cardno":8651140,"endTime":"13:09:10"},{"club":"ECU","name":"NINASUNTA YUGCHA L","cardno":8651027,"endTime":"12:50:53"},{"club":"VEN","name":"PRIETO L","cardno":8650967,"endTime":"13:45:08"},{"club":"ARM","name":"MKHITARYAN Y","cardno":8650949,"endTime":"13:26:39"},{"club":"SUI","name":"MEIER CS","cardno":8650941,"endTime":"12:12:25"},{"club":"IRI","name":"TATAR MK","cardno":8651067,"endTime":"14:11:10"},{"club":"BRA","name":"NITSCH C","cardno":8650905,"endTime":"12:46:45"},{"club":"ESP","name":"PERPEN MARTINEZ AE","cardno":8651081,"endTime":"12:53:40"},{"club":"AUT","name":"BONEK J","cardno":8650933,"endTime":"13:19:11"},{"club":"NED","name":"POSTHOUWER R","cardno":8651071,"endTime":"13:28:02"},{"club":"RUS","name":"DOBRYNIN S","cardno":8651015,"endTime":"12:17:53"},{"club":"ESP","name":"VERA GUERRERO C","cardno":8651136,"endTime":"13:02:06"},{"club":"SWE","name":"NIKOLAUSSON A","cardno":8651036,"endTime":"13:01:31"},{"club":"SRB","name":"SAVIC S","cardno":8651119,"endTime":"13:01:39"},{"club":"SUI","name":"KYBURZ A","cardno":8651003,"endTime":"12:16:03"},{"club":"IRI","name":"ALI REZA K","cardno":8651115,"endTime":"14:05:08"},{"club":"LTU","name":"STULGYS D","cardno":8651032,"endTime":"12:50:15"},{"club":"CHN","name":"DUAN A","cardno":8650943},{"club":"BUL","name":"OVCHAROV A","cardno":8650926,"endTime":"13:41:28"},{"club":"ARM","name":"MANASYAN Y","cardno":8650939,"endTime":"14:51:50"},{"club":"URU","name":"CHRISTIAN JESUS CB","cardno":8650962,"endTime":"13:27:39"},{"club":"KAZ","name":"VLASSOV D","cardno":8651065,"endTime":"12:54:01"},{"club":"UAE","name":"ALHASSANI S","cardno":8650960,"endTime":"13:27:28"},{"club":"BRA","name":"TOGNI G","cardno":8650935,"endTime":"12:57:34"},{"club":"POL","name":"RICHERT M","cardno":8650984,"endTime":"12:44:53"},{"club":"DEN","name":"HELWEG LA","cardno":8651023,"endTime":"13:34:05"},{"club":"VEN","name":"DURAN J","cardno":8651134},{"club":"BEL","name":"GROSDENT S","cardno":8650907,"endTime":"14:00:46"},{"club":"CHI","name":"ARRIAGADA J","cardno":8650938,"endTime":"13:14:03"},{"club":"FIN","name":"PAASIKOSKI A","cardno":8651144,"endTime":"13:38:13"},{"club":"FRA","name":"GIRES N","cardno":8651039,"endTime":"13:08:27"},{"club":"ECU","name":"CHACON TAPIA MR","cardno":8651097,"endTime":"13:54:11"},{"club":"GER","name":"FRIELING B","cardno":8651018,"endTime":"13:26:20"},{"club":"ROU","name":"OVIDIU MUGUREL M","cardno":8651101,"endTime":"13:42:18"},{"club":"BRA","name":"EV I","cardno":8650911,"endTime":"12:50:43"},{"club":"VEN","name":"ROMERO J","cardno":8650917,"endTime":"14:26:30"},{"club":"EST","name":"RJABOSHKIN S","cardno":8651069,"endTime":"12:50:43"},{"club":"ROU","name":"PAUL MARIUS BC","cardno":8651088,"endTime":"13:18:22"},{"club":"GER","name":"REHNER K","cardno":8651044,"endTime":"13:33:47"},{"club":"FIN","name":"SALONEN M","cardno":8651111,"endTime":"12:57:17"},{"club":"RUS","name":"NOVIKOV V","cardno":8650969,"endTime":"12:50:47"},{"club":"CHN","name":"CONG X","cardno":8650930},{"club":"ECU","name":"NINASUNTA IZA AW","cardno":8651038,"endTime":"13:25:58"},{"club":"SRB","name":"MILIC M","cardno":8651021,"endTime":"13:19:20"},{"club":"NED","name":"HEREIJGERS R","cardno":8650998,"endTime":"14:09:19"},{"club":"BEL","name":"SIMKENS G","cardno":8650913,"endTime":"13:02:55"},{"club":"AUT","name":"KASTNER N","cardno":8650945,"endTime":"13:06:58"},{"club":"UAE","name":"ALMURSHIDI A","cardno":8651131,"endTime":"14:39:10"},{"club":"SUI","name":"HUBMANN M","cardno":8651011,"endTime":"12:53:40"},{"club":"CHI","name":"CIFUENTES J","cardno":8650908,"endTime":"13:19:02"},{"club":"FRA","name":"RAUTURIER Q","cardno":8651077,"endTime":"13:09:37"},{"club":"LTU","name":"BARTKEVICIUS A","cardno":8651047,"endTime":"13:27:31"},{"club":"IRI","name":"KOSHKI S","cardno":8650987,"endTime":"13:50:55"},{"club":"KAZ","name":"NAZYROV A","cardno":8651094,"endTime":"13:46:44"},{"club":"HUN","name":"VASS TC","cardno":8651063,"endTime":"13:59:36"},{"club":"DEN","name":"MIKKELSEN A","cardno":8651020,"endTime":"14:00:40"},{"club":"POL","name":"DUTKOWSKI M","cardno":8651033,"endTime":"13:13:14"},{"club":"SWE","name":"LIF A","cardno":8650966,"endTime":"13:34:03"},{"club":"LAT","name":"JUBELIS A","cardno":8651099,"endTime":"13:29:38"},{"club":"ESP","name":"LOPEZ LOPEZ A","cardno":8650914,"endTime":"13:33:42"},{"club":"NED","name":"SMULDERS M","cardno":8651133,"endTime":"13:59:16"},{"club":"BRA","name":"PASTURIZA L","cardno":8650936,"endTime":"13:19:13"},{"club":"EST","name":"SILD L","cardno":8651056,"endTime":"13:11:09"},{"club":"SWE","name":"ANDERSSON W","cardno":8650983,"endTime":"13:59:07"},{"club":"GER","name":"KARSTAEDT S","cardno":8651031,"endTime":"14:09:14"},{"club":"SUI","name":"EGGER JE","cardno":8650979,"endTime":"13:09:33"},{"club":"LTU","name":"ALELIUNAS V","cardno":8651068,"endTime":"13:18:05"},{"club":"DEN","name":"ANDERSEN JRR","cardno":8651005,"endTime":"13:56:34"},{"club":"CHI","name":"GARCIA H","cardno":8650901,"endTime":"13:58:43"},{"club":"ROU","name":"ISTVAN FERENC S","cardno":8651113,"endTime":"13:52:15"},{"club":"ESP","name":"GARCIA CRESPO JM","cardno":8651086,"endTime":"13:39:19"},{"club":"BUL","name":"TERZIEV T","cardno":8650906,"endTime":"13:56:35"},{"club":"POL","name":"PAWLAK B","cardno":8650934,"endTime":"13:26:00"},{"club":"VEN","name":"CONTRERAS N","cardno":8651118,"endTime":"14:52:14"},{"club":"FIN","name":"SAARI A","cardno":8651098,"endTime":"13:53:10"},{"club":"IRI","name":"SADEGZADEH AKBARA.","cardno":8651008,"endTime":"14:02:26"},{"club":"SRB","name":"IVKOVIC S","cardno":8651109,"endTime":"14:30:11"},{"club":"RUS","name":"NAKONECHNYI D","cardno":8651138,"endTime":"13:27:00"},{"club":"UAE","name":"ALZEYOUDI S","cardno":8650977,"endTime":"14:31:28"},{"club":"KAZ","name":"ADAMOVICH D","cardno":8651141,"endTime":"14:15:55"},{"club":"HUN","name":"MOLNAR Z","cardno":8651076,"endTime":"14:31:39"},{"club":"AUT","name":"PETER M","cardno":8650920,"endTime":"13:28:53"},{"club":"FRA","name":"RIO N","cardno":8651061,"endTime":"13:40:07"},{"club":"ECU","name":"GUAMAN JEREZ ER","cardno":8650976,"endTime":"14:01:34"},{"club":"BEL","name":"JANSSENS T","cardno":8650947,"endTime":"13:59:02"},{"club":"LAT","name":"REKUNENKO A","cardno":8651012,"endTime":"13:39:02"},{"club":"FRA","name":"BASSET L","cardno":8650970,"endTime":"13:27:13"},{"club":"BRA","name":"NASCIMENTO F","cardno":8650929,"endTime":"14:05:57"},{"club":"CHN","name":"ZHENG W","cardno":8650912},{"club":"BEL","name":"ANCIAUX B","cardno":8650937,"endTime":"14:16:10"},{"club":"ROU","name":"PAUL CONSTANTIN P","cardno":8650991,"endTime":"14:16:29"},{"club":"FIN","name":"AHO A","cardno":8650952,"endTime":"14:14:05"},{"club":"LTU","name":"GVILDYS JV","cardno":8651051,"endTime":"13:35:29"},{"club":"LAT","name":"BERTUKS E","cardno":8651053,"endTime":"13:38:31"},{"club":"AUT","name":"MERL R","cardno":8650940,"endTime":"13:42:15"},{"club":"IRI","name":"MOSLEM ASLANI K","cardno":8651059,"endTime":"14:50:05"},{"club":"HUN","name":"BAUMHOLCZER M","cardno":8651054,"endTime":"13:51:43"},{"club":"RUS","name":"KHRAMOV A","cardno":8651004,"endTime":"13:38:26"},{"club":"DEN","name":"JENSEN TG","cardno":8651073,"endTime":"14:20:30"},{"club":"VEN","name":"ROJAS O","cardno":8651010,"endTime":"14:48:31"},{"club":"GER","name":"HEININGER D","cardno":8650971,"endTime":"14:50:42"},{"club":"POL","name":"OLEJNIK M","cardno":8650985,"endTime":"13:46:42"},{"club":"UAE","name":"ALYAMMAHI Salem","cardno":8651104,"endTime":"15:18:21"},{"club":"SWE","name":"SKOGTJAERN P","cardno":8650974,"endTime":"14:10:54"},{"club":"SUI","name":"HOWALD F","cardno":8650982,"endTime":"13:42:20"},{"club":"ECU","name":"IMBAQUINGO PAMBAQ.","cardno":8651072,"endTime":"14:21:31"},{"club":"SRB","name":"CORIC Z","cardno":8651117,"endTime":"14:16:18"},{"club":"KAZ","name":"SUKHONOSSOV F","cardno":8651127,"endTime":"14:48:30"},{"club":"ESP","name":"JIMENEZ MOLINA S","cardno":8651080,"endTime":"14:26:55"},{"club":"EST","name":"HEINMANN K","cardno":8650975,"endTime":"14:11:42"},{"club":"VEN","name":"ROJAS J","cardno":8651142,"endTime":"15:16:04"},{"club":"LAT","name":"PAULINS A","cardno":8650997,"endTime":"13:54:04"},{"club":"FIN","name":"RUOHOLA A","cardno":8651093,"endTime":"13:56:38"},{"club":"ECU","name":"HERRERA SALAZAR JD","cardno":8651055,"endTime":"14:28:59"},{"club":"CHN","name":"YANG C","cardno":8651074},{"club":"SUI","name":"KYBURZ M","cardno":8651001,"endTime":"13:58:34"},{"club":"LTU","name":"BELIUNAS V","cardno":8651014,"endTime":"14:15:38"},{"club":"BUL","name":"BELOMAZHEV S","cardno":8650942,"endTime":"14:16:01"},{"club":"DEN","name":"WEBER JF","cardno":8651084,"endTime":"14:29:14"},{"club":"HUN","name":"MOLNAR DR. A","cardno":8650903,"endTime":"14:54:50"},{"club":"GER","name":"RUECKER K","cardno":8651137,"endTime":"16:09:22"},{"club":"POL","name":"KOWALSKI W","cardno":8651147,"endTime":"14:01:11"},{"club":"IRI","name":"TAZROO E","cardno":8651066,"endTime":"15:48:46"},{"club":"EST","name":"SILD T","cardno":8650989,"endTime":"14:01:28"},{"club":"FRA","name":"TRANCHAND F","cardno":8651085,"endTime":"14:01:15"},{"club":"AUT","name":"YMSEN GE","cardno":8650927,"endTime":"14:05:57"},{"club":"ESP","name":"RODRIGUEZ DOMINGU.","cardno":8651121,"endTime":"14:53:29"},{"club":"BEL","name":"LINTEN J","cardno":8650910,"endTime":"14:45:34"},{"club":"ROU","name":"IONUT ALIN Z","cardno":8651016,"endTime":"14:06:07"},{"club":"SWE","name":"WICKBOM R","cardno":8651143},{"club":"RUS","name":"TCVETKOV D","cardno":8651030,"endTime":"14:06:02"}
            ]
        }
    },
    methods:{
        showSetModel(){//设置页面
            this.showSet=!this.showSet
        },
        selectAll(){//选择全部
            this.isSelectAll = !this.isSelectAll
            this.playInfo.forEach((item,itemIndex)=>{
                if(this.isSelectAll){
                    this.$set(this.playInfo[itemIndex], 'isSelect', true)
                    if(this.playInfo[itemIndex].marker){
                        this.createmap.add(this.playInfo[itemIndex].marker)
                        // this.playInfo[itemIndex].marker.show()
                    }
                    if(this.playInfo[itemIndex].passedPolyline){
                        this.createmap.add(this.playInfo[itemIndex].passedPolyline)
                        // this.playInfo[itemIndex].passedPolyline.show()
                    }
                    if(this.playInfo[itemIndex].passedPolyline1){
                        this.createmap.add(this.playInfo[itemIndex].passedPolyline1)
                        // this.playInfo[itemIndex].passedPolyline1.show()
                    }
                     if(this.manList['historymarker'+item.id]){
                        // this.createmap.add(this.manList['historymarker'+item.id])
                        // this.createmap.add(this.manList['historypassedPolyline'+item.id])
                        // this.createmap.add(this.manList['historypassedPolyline1'+item.id])

                        this.manList['historymarker'+item.id].show()
                        this.manList['historypassedPolyline'+item.id].show()
                    }
                    
                }else{
                    this.$set(this.playInfo[itemIndex], 'isSelect', false)
                    if(this.playInfo[itemIndex].marker){
                        this.createmap.remove(this.playInfo[itemIndex].marker)
                        // this.playInfo[itemIndex].marker.hide()
                    }
                    if(this.playInfo[itemIndex].passedPolyline){
                        this.createmap.remove(this.playInfo[itemIndex].passedPolyline)
                        // this.playInfo[itemIndex].passedPolyline.hide()

                    }
                    if(this.playInfo[itemIndex].passedPolyline1){
                        this.createmap.remove(this.playInfo[itemIndex].passedPolyline1)
                        // this.playInfo[itemIndex].passedPolyline1.hide()
                    }
                     if(this.manList['historymarker'+item.id]){
                        // this.createmap.remove(this.manList['historymarker'+item.id])
                        // this.createmap.remove(this.manList['historypassedPolyline'+item.id])
                        this.createmap.remove(this.manList['historypassedPolyline1'+item.id])
                        this.manList['historymarker'+item.id].hide()
                        this.manList['historypassedPolyline'+item.id].hide()
                        // this.manList['historypassedPolyline1'+item.id].hide()
                    }
                }
                
            })
        },
        selectPlay(index){//选中选手
            this.playInfo.forEach((item,itemIndex)=>{
                if(index==itemIndex){
                    this.$set(this.playInfo[itemIndex], 'active', true)
                }else{
                    this.$set(this.playInfo[itemIndex], 'active', false)
                }
            })
            // console.log(this.playInfo)
        },
        selectPlayer(index,id){//选择选手
            if(this.playInfo[index].isSelect){
                if(this.playInfo[index].marker){
                    this.createmap.remove(this.playInfo[index].marker)
                    // this.playInfo[index].marker.hide()
                }
                if(this.playInfo[index].passedPolyline){
                    this.createmap.remove(this.playInfo[index].passedPolyline)
                    // this.playInfo[index].passedPolyline.hide()
                }
                if(this.playInfo[index].passedPolyline1){
                    this.createmap.remove(this.playInfo[index].passedPolyline1)
                    // this.playInfo[index].passedPolyline1.hide()
                }
                if(this.manList['historymarker'+id]){
                    // this.createmap.remove(this.manList['historymarker'+id])
                    // this.createmap.remove(this.manList['historypassedPolyline'+id])

                    this.manList['historymarker'+id].hide()
                    this.manList['historypassedPolyline'+id].hide()
                    this.createmap.remove(this.manList['historypassedPolyline1'+this.playInfo[index].id])
                }
                this.$set(this.playInfo[index], 'fullrouteset', false)
                
            }else{
                
                if(this.playInfo[index].marker){
                    // (this.playInfo[index].marker).show()
                    this.createmap.add(this.playInfo[index].marker)
                }
                if(this.playInfo[index].passedPolyline){
                    // (this.playInfo[index].passedPolyline).show()
                    this.createmap.add(this.playInfo[index].passedPolyline)
                }
                if(this.playInfo[index].passedPolyline1){
                    // (this.playInfo[index].passedPolyline1).show()
                    this.createmap.add(this.playInfo[index].passedPolyline1)
                }
                if(this.manList['historymarker'+id]){
                    // this.createmap.add(this.manList['historymarker'+id])
                    // this.createmap.add(this.manList['historypassedPolyline'+id])
                    this.manList['historymarker'+id].show()
                    this.manList['historypassedPolyline'+id].show()
                }
            }
            this.$set(this.playInfo[index], 'isSelect', !this.playInfo[index].isSelect)
        },
        select_effect(index,ele){//选择显示效果
            // console.log(this.manList)
            if(ele == 'center'){
                this.$set(this.playInfo[index], 'centerset', !this.playInfo[index].centerset)
                // console.log(this.playInfo[index].id)
                // console.log(this.manList['historymarker'+this.playInfo[index].id].getPosition())
                if(this.isplay){ //直播
                    this.createmap.setCenter([
                        this.playInfo[index].marker.getPosition().lng,
                        this.playInfo[index].marker.getPosition().lat
                    ])
                }else{ //回放
                    this.createmap.setCenter([
                        this.manList['historymarker'+this.playInfo[index].id].getPosition().lng,
                        this.manList['historymarker'+this.playInfo[index].id].getPosition().lat
                    ])
                }
            }else if(ele == 'autocenter'){
                this.$set(this.playInfo[index], 'autocenterset', !this.playInfo[index].autocenterset)
            }else if(ele == 'highlight'){
                let infoList = document.getElementById(this.playInfo[index].id)
                if(!this.playInfo[index].highlightset){ //高亮
                    infoList.style.background="#fff"
                    infoList.style.border="1px solid #333"
                }else{ //取消高亮效果
                    infoList.style.background="transparent"
                    infoList.style.border="none"
                }
                this.$set(this.playInfo[index], 'highlightset', !this.playInfo[index].highlightset)
            }else if(ele == 'fullroute'){
                this.$set(this.playInfo[index], 'fullrouteset', !this.playInfo[index].fullrouteset)
                if(this.playInfo[index].fullrouteset){
                    this.createmap.add(this.manList['historypassedPolyline1'+this.playInfo[index].id])
                }else{
                    this.createmap.remove(this.manList['historypassedPolyline1'+this.playInfo[index].id])
                }
                
            }
        },
        handleClick (e) {
            console.log('click', e)
        },
        checkboxonChange(checkedValues){//多选框选择
            console.log('checked = ', checkedValues)
        },
        markeronChange(value) {//marker宽高设置
            this.$emit('markerset',value)
            this.markerWH = value
        },
        tailOnChange(value){//尾巴设置
            this.$emit('tailset',value)
        },
        letteronChange(value){//marker文字大小设置
            this.$emit('letterset',value)
            this.letterfontsize = value
        },
        mapOpacityonChange(value){//地图透明度设置
            this.$emit('mapOpacitySet',value)
            this.mapOpacity = value
        }
    }
}
</script>>
<style lang="scss" scoped>
.left{
    color: #fff;
    width: 252px;
    background-color: #59ACF8;
    padding: 10px;
    padding-left: 15px;
    cursor: pointer;
    height: 100%;
    .set{
        display: flex;
        align-items: center;
        img{
            width: 18px;
            cursor: pointer;
        }
        div{
            flex: 1;
            margin-left: 10px;
            background: url('../assets/images/search.png') no-repeat left 8px center;
            background-size: 15px 17px;
            background-color: #fff;
            margin-right: 15px;
            padding-left: 20px;
            border-radius: 34px;
            input{
                width: 100%;
                height: 28px;
                border-radius: 34px;
                color: #333;
                border: none;
                cursor: initial;
                outline: none;
                &:focus{
                    outline: none
                }
            }
        }
    }
    .selectAll{
        margin-top: 8px;
        span:nth-child(1){
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 2px solid #fff;
            border-radius: 50%;
            vertical-align: middle;
            &.selectAllActive{
                background:url("../assets/images/selectAllIcon.png") no-repeat center center #fff;
                background-size: 12px 9px
            }
        }
        span:nth-child(2){
            vertical-align: middle;
            margin-left: 10px
        }
    }
    .player_list{
        padding: 10px 0;
        overflow-y: auto;
        height: 430px;
        padding-right: 5px;
        overflow-x: hidden;
        li{
            padding: 10px;
            font-size: 14px;
            border-radius: 5px;
            &.player_active{
                background-color: #8AC3F7;
            }
            .player_info{
                p:nth-child(1){
                    display: flex;
                    align-items: center;
                    span:nth-child(1){
                        display: inline-block;
                        width: 14px;
                        height: 14px;
                        border: 1px solid #666;
                        border-radius: 50%;
                        background-color: #fff;
                        margin-right: 10px;
                    }
                }
                p:nth-child(2){
                    padding-left: 25px;
                    font-size: 12px;
                    span{
                        margin-right: 15px
                    }
                }
                p:nth-child(3){
                    padding-left: 25px;
                    font-size: 12px;
                    span{
                        margin-right: 15px
                    }
                }
            }
            .play_detail{
                padding: 0 25px;
                padding-right: 0;
                font-size: 12px;
                p{
                    display: flex;
                    justify-content: space-between;
                    margin-top: 3px;
                    font-weight: 900;
                    span{
                        font-weight: normal;
                        &:hover{
                            font-weight: 900
                        }
                    }
                    .setActive{
                        color: #D10011;
                        &:hover{
                            font-weight: normal
                        }
                    }
                }
                .color_show{
                    width: 22px;
                    height: 22px;
                    background-color: red;
                }
            }
        }
    }
    .player_list::-webkit-scrollbar{
        width: 5px;
    }
    .player_list::-webkit-scrollbar-thumb{
        background-color: #fff;
    }
    .player_list::-webkit-scrollbar-track{
        background-color: #59ACF8;
    }
    .player_list::-webkit-scrollbar{
        background-color: #59ACF8;
    }
}
.left_set{
    color: #fff;
    width: 252px;
    background-color: #59ACF8;
    // padding: 10px;
    height: 100%;
    .set_btn{
        padding-left: 15px;
        padding-top: 10px;
        margin-bottom: 10px;
        cursor: pointer;
        img{
            width: 18px;
        }
    }
    .menutest{
        overflow-y: auto;
        height: 550px;
        .set_detail{
            background-color: rgba(138,195,247,1);
            height:auto;
            overflow: inherit;
            margin: 0;
            padding-bottom: 6px;
            .checkbosSet{
                font-size: 12px;
                margin-top: 10px
            }
            .LangedalSet{
                div:nth-child(1){
                    input{
                        text-align: center;
                        background-color: #fff;
                        width: 120px;
                        height: 30px;
                        border: 1px solid #59acf8
                    }
                    span{
                        display: inline-block;
                        height: 30px;
                        width: 50px;
                        color: #fff;
                        border-radius: 4px;
                        background-color: #59acf8;
                        text-align: center;
                        line-height: 30px;
                        vertical-align: middle;
                        margin-left: 6px
                    }
                }
                div:nth-child(2){
                    background-color: #1e89ea;
                    text-align: center;
                    height: 32px;
                    line-height: 32px;
                    border-radius: 4px;
                    width: 176px;
                    margin-top: 4px
                }
            }
            .slider{
                margin: 0
            }
            p{
                margin-bottom: 0
            }
            label{
                color: #fff
            }
        }
    }
    .set_item{
        overflow-y: auto;
        height: 550px;
        li{
            margin-top: 10px;
            .set_item_title{
                padding-left: 30px;
                padding-right: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 16px;
                img{
                    width: 13px;
                    height: 9px;
                }
            }
            .set_detail{
                background-color: rgba(138,195,247,1);
                padding-left: 50px;
                margin-top: 8px;
                font-size: 14px;
                padding-bottom: 6px;
                p{
                    line-height: 30px;
                    margin-bottom: 0
                }
                .slider{
                    width: 150px;
                    margin: 0;

                }
                label{
                    color: #fff
                }
            }
        }
    }
    .menutest::-webkit-scrollbar{
        width: 5px;
    }
    .menutest::-webkit-scrollbar-thumb{
        background-color: #fff;
    }
    .menutest::-webkit-scrollbar-track{
        background-color: #59ACF8;
    }
    .menutest::-webkit-scrollbar{
        background-color: #59ACF8;
    }
}
@media screen and (min-width:1366px) and (max-width:1440px){
        .map_page{
            height: 500px;
        }
        .map_page .left .player_list{
            height: 400px;
        }
    }
    @media screen and (min-width:1440px) and (max-width:1600px){
        .map_page{
            height: 600px;
        }
        .map_page .left .player_list{
            height: 500px;
        }
    }
    @media screen and (min-width:1600px) and (max-width:1680px){
        .map_page{
            height: 640px;
        }
        .map_page .left .player_list{
            height: 540px;
        }
    }
    @media screen and (min-width:1680px) and (max-width:1920px){
        .map_page{
            height: 750px;
        }
        .map_page .left .player_list{
            height: 650px;
        }
    }
    @media screen and (min-width:1920px){
        .map_page{
            height: 780px;
        }
        .map_page .left .player_list{
            height: 680px;
        }
        .map_page .left .player_list li .player_info p:nth-child(1){
            font-size: 16px
        }
        .map_page .left .player_list li .player_info p:nth-child(2){
            font-size: 14px
        }
    }
    .select_point{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(29,29,29,.4);
        .select_point_model{
            width: 200px;
            height: 300px;
            background-color: #fff;
            border-radius: 10px;
            left: 50%;
            top: 50%;
            margin: 0 auto;
            margin-top: 70px;
            padding: 14px 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .select_point_title{
                font-weight: 700;
            }
            .select_points_list{
                flex: 1;
                margin: 6px 0;
                ul{
                    display: flex;
                    flex-wrap: wrap;
                    li{
                        width: 50%;
                        text-align: center;
                        cursor: pointer;
                        margin: 2px 0;
                        span:nth-child(1){
                            display: inline-block;
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            border: 1px solid #666;
                            margin-right: 6px
                        }
                    }
                    .selectedPoint{
                        span:nth-child(1){
                            background-color: #1E89EA;
                        }
                    }
                }
            }
            .select_points_foot{
                display: flex;
                align-items: center;
                justify-content: space-around;
                p{
                    cursor: pointer;
                }
                p:nth-child(2){
                    color: #59ACF8
                }
            }
        }
    }
</style>>